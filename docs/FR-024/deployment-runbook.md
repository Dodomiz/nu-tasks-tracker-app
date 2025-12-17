# FR-024 Dashboard Optimizations - Deployment Runbook

**Version:** 1.0  
**Last Updated:** December 17, 2025  
**Owned By:** Engineering Team  
**Severity:** High (Performance Feature)

---

## Overview

This runbook guides the deployment of FR-024 dashboard optimizations, including MongoDB schema migration, Redis caching, and gradual feature rollout.

**What's Being Deployed:**
- MongoDB denormalized fields (taskCount, lastActivity)
- Three compound indexes for dashboard queries
- Aggregation pipeline optimization (eliminates N+1 queries)
- Redis caching layer with in-memory fallback
- Percentage-based feature flags for gradual rollout

**Expected Impact:**
- Dashboard query time: 500ms → 50ms (10x faster)
- Cache hit ratio: >70% after warmup
- Database load: -80% for dashboard queries

---

## Pre-Deployment Checklist

### Environment Validation
- [ ] **MongoDB:** Version 4.4+ (aggregation pipeline support)
- [ ] **Redis:** Version 6.0+ OR use in-memory fallback
- [ ] **.NET:** Version 9.0+
- [ ] **Backup:** Full database backup taken within last 24h

### Configuration Files
- [ ] `appsettings.json`: Redis connection string configured
- [ ] `appsettings.json`: Feature flag set to `"DashboardOptimizations": 0` (start at 0%)
- [ ] Environment variables: `ASPNETCORE_ENVIRONMENT=Production`

### Monitoring Setup
- [ ] Health check endpoint accessible: `/health`
- [ ] Metrics endpoint accessible: `/api/dashboard/metrics/summary`
- [ ] Log aggregation configured (Serilog → file/console)
- [ ] Alert thresholds set (error rate >5%, p95 latency >200ms)

---

## Deployment Steps

### Phase 1: Database Migration (30 minutes)

#### Step 1.1: Backup Current State
```bash
# Full database backup
mongodump --uri="mongodb://localhost:27017/tasks-tracker" --out=/backup/fr024-pre-migration-$(date +%Y%m%d)

# Verify backup
ls -lh /backup/fr024-pre-migration-*/tasks-tracker/
```

**Success Criteria:** Backup directory contains `groups.bson` and `tasks.bson`

#### Step 1.2: Run Migration Script
```bash
# Navigate to scripts directory
cd /path/to/backend/scripts

# Run migration
mongosh "mongodb://localhost:27017/tasks-tracker" migrate-fr024-dashboard.js > migration.log 2>&1

# Check results
cat migration.log
```

**Success Criteria:**
- ✅ "Migration Complete" message appears
- ✅ Zero errors in log
- ✅ All groups have `taskCount`, `lastActivity`, `schemaVersion: 2`

#### Step 1.3: Verify Indexes
```bash
mongosh "mongodb://localhost:27017/tasks-tracker" --eval "db.groups.getIndexes()" | grep -E "(idx_members_userId_lastActivity|idx_members_userId_role|idx_taskCount)"
```

**Success Criteria:**
- ✅ Three new indexes present
- ✅ Index names match migration script

**Rollback Command (if needed):**
```bash
mongosh "mongodb://localhost:27017/tasks-tracker" rollback-fr024-dashboard.js
```

---

### Phase 2: Application Deployment (15 minutes)

#### Step 2.1: Deploy Backend
```bash
# Pull latest code
git pull origin main

# Build application
cd backend/src/TasksTracker.Api
dotnet build -c Release

# Run tests
dotnet test ../../tests/TasksTracker.Api.Tests

# Publish
dotnet publish -c Release -o /publish/fr024
```

**Success Criteria:**
- ✅ Build completes with 0 errors
- ✅ All tests pass
- ✅ Publish directory contains TasksTracker.Api.dll

#### Step 2.2: Update Configuration
```bash
# Edit appsettings.json
nano /publish/fr024/appsettings.json
```

**Required Changes:**
```json
{
  "ConnectionStrings": {
    "MongoDb": "mongodb://localhost:27017/tasks-tracker",
    "Redis": "localhost:6379"  // Or leave empty for in-memory fallback
  },
  "FeatureFlags": {
    "DashboardOptimizations": 0  // Start at 0%, increase gradually
  }
}
```

#### Step 2.3: Restart Application
```bash
# Stop current application
systemctl stop tasksTrackerApi

# Start new version
systemctl start tasksTrackerApi

# Verify startup
systemctl status tasksTrackerApi
journalctl -u tasksTrackerApi -n 50 --no-pager
```

**Success Criteria:**
- ✅ "Application started" message in logs
- ✅ "Redis connected" OR "Using in-memory cache" message
- ✅ "Feature flag: DashboardOptimizations = 0%" message
- ✅ Health check returns 200: `curl http://localhost:5000/health`

---

### Phase 3: Gradual Rollout (3-7 days)

#### Day 1-2: Internal Testing (0% → 10%)
```bash
# Enable for 10% of users
curl -X PATCH http://localhost:5000/api/admin/feature-flags \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"DashboardOptimizations": 10}'

# OR manually edit appsettings.json and restart
```

**Monitoring:**
- Watch error rate: `curl http://localhost:5000/api/dashboard/metrics/summary`
- Check p95 latency: Should be <100ms
- Monitor cache hit rate: Should reach >50% within 1 hour

**Abort Criteria:**
- Error rate >5% compared to baseline
- P95 latency >200ms
- Cache failures causing user-visible errors

#### Day 3-4: Beta Rollout (10% → 30% → 70%)
Increase percentage every 12-24 hours:
```json
// Day 3 morning
"DashboardOptimizations": 30

// Day 3 evening (if no issues)
"DashboardOptimizations": 70
```

**Monitoring:**
- Dashboard queries per minute should increase 3-7x (more users)
- Cache hit rate should stabilize at >70%
- P95 latency should remain <100ms

#### Day 5-7: Full Rollout (70% → 100%)
```json
"DashboardOptimizations": 100
// OR
"DashboardOptimizations": true
```

**Success Criteria:**
- ✅ All users on new dashboard
- ✅ Error rate baseline or lower
- ✅ P95 latency <100ms
- ✅ Cache hit rate >70%
- ✅ Zero critical bugs reported

---

## Monitoring & Alerts

### Key Metrics to Watch

#### 1. Dashboard Query Performance
```bash
# Check p95 latency every 5 minutes
curl http://localhost:5000/api/dashboard/metrics/summary?lastMinutes=5 | jq '.p95DurationMs'
```

**Thresholds:**
- 🟢 Good: <100ms
- 🟡 Warning: 100-200ms
- 🔴 Critical: >200ms

#### 2. Cache Hit Rate
```bash
curl http://localhost:5000/api/dashboard/metrics/summary?lastMinutes=60 | jq '.cacheHitRate'
```

**Thresholds:**
- 🟢 Good: >70%
- 🟡 Warning: 50-70%
- 🔴 Critical: <50%

#### 3. Error Rate
```bash
# Check application logs
journalctl -u tasksTrackerApi --since "5 minutes ago" | grep -i error | wc -l
```

**Thresholds:**
- 🟢 Good: <10 errors/5min
- 🟡 Warning: 10-50 errors/5min
- 🔴 Critical: >50 errors/5min

#### 4. Health Check
```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "Healthy",
  "results": {
    "dashboard": {
      "status": "Healthy",
      "data": {
        "cache_available": true,
        "cache_type": "RedisCacheService",
        "dashboard_service_available": true
      }
    }
  }
}
```

---

## Rollback Procedures

### Scenario 1: Migration Issues (Before App Deployment)

**Symptoms:** Migration script fails, data inconsistencies

**Rollback Steps:**
```bash
# Run rollback script
mongosh "mongodb://localhost:27017/tasks-tracker" rollback-fr024-dashboard.js

# Verify rollback
mongosh "mongodb://localhost:27017/tasks-tracker" --eval "db.groups.countDocuments({ schemaVersion: 2 })"
# Should return 0

# Restore from backup if needed
mongorestore --uri="mongodb://localhost:27017" --drop /backup/fr024-pre-migration-*/
```

**Estimated Time:** 10-15 minutes

---

### Scenario 2: Performance Degradation (After Rollout)

**Symptoms:** P95 latency >200ms, error rate >5%

**Rollback Steps:**
```bash
# Step 1: Reduce feature flag percentage
# Edit appsettings.json
"DashboardOptimizations": 0  # Disable for all users

# Step 2: Restart application
systemctl restart tasksTrackerApi

# Step 3: Verify old dashboard working
curl http://localhost:5000/api/dashboard?page=1&pageSize=10

# Step 4: Monitor for 10 minutes
watch -n 30 'curl -s http://localhost:5000/api/dashboard/metrics/summary | jq ".p95DurationMs"'
```

**Estimated Time:** 5 minutes

**Permanent Rollback (if needed):**
```bash
# Revert to previous application version
cd /publish
cp -r tasksTrackerApi-v1.0 tasksTrackerApi
systemctl restart tasksTrackerApi
```

---

### Scenario 3: Redis Outage

**Symptoms:** Cache errors in logs, in-memory fallback triggered

**No Action Required:**
- ✅ Application automatically falls back to in-memory cache
- ✅ Performance slightly degraded but acceptable
- ✅ All requests continue to work

**Optional: Restart Redis**
```bash
systemctl restart redis
systemctl status redis

# Verify connection
redis-cli ping
# Should return: PONG
```

---

## Post-Deployment Validation

### Smoke Tests (Run Immediately After Deployment)

#### Test 1: Dashboard Query
```bash
curl -H "Authorization: Bearer $USER_TOKEN" \
  http://localhost:5000/api/dashboard?page=1&pageSize=10
```

**Expected:** 200 OK, JSON response with groups array

#### Test 2: Task Creation (Verify taskCount Increment)
```bash
# Get initial taskCount
INITIAL_COUNT=$(curl -H "Authorization: Bearer $USER_TOKEN" \
  http://localhost:5000/api/dashboard?page=1&pageSize=1 | jq '.groups[0].taskCount')

# Create task
curl -X POST -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"groupId": "...", "title": "Test Task", "assignedUserId": "..."}' \
  http://localhost:5000/api/tasks

# Get new taskCount (after cache invalidation)
NEW_COUNT=$(curl -H "Authorization: Bearer $USER_TOKEN" \
  http://localhost:5000/api/dashboard?page=1&pageSize=1 | jq '.groups[0].taskCount')

# Verify increment
[ $NEW_COUNT -eq $((INITIAL_COUNT + 1)) ] && echo "✅ Task count increment working"
```

#### Test 3: Cache Invalidation
```bash
# Get metrics before
BEFORE=$(curl http://localhost:5000/api/dashboard/metrics/summary | jq '.cacheHitRate')

# Make dashboard request (should cache)
curl -H "Authorization: Bearer $USER_TOKEN" http://localhost:5000/api/dashboard

# Make same request (should hit cache)
curl -H "Authorization: Bearer $USER_TOKEN" http://localhost:5000/api/dashboard

# Get metrics after
AFTER=$(curl http://localhost:5000/api/dashboard/metrics/summary | jq '.cacheHitRate')

echo "Cache hit rate: $BEFORE → $AFTER (should increase)"
```

---

## Troubleshooting

### Issue: Migration Script Fails

**Error:** `Cannot read property 'updatedAt' of null`

**Solution:**
```bash
# Some groups have no tasks, check migration logic
mongosh "mongodb://localhost:27017/tasks-tracker" --eval "
  db.groups.find({ _id: ObjectId('...') }).forEach(group => {
    const taskCount = db.tasks.countDocuments({ groupId: group._id.toString() });
    print('Group ' + group.name + ' has ' + taskCount + ' tasks');
  });
"
```

---

### Issue: High Cache Miss Rate (<50%)

**Symptoms:** Cache hit rate below 50% after 1 hour

**Diagnosis:**
```bash
# Check cache TTL
curl http://localhost:5000/api/dashboard/metrics/raw | jq '.[] | select(.cacheHit == false)'
```

**Solution:**
- Increase cache TTL from 5 minutes to 10 minutes in `CachedDashboardService.cs`
- Restart application

---

### Issue: P95 Latency Still High (>200ms)

**Symptoms:** Optimization enabled but latency not improved

**Diagnosis:**
```bash
# Check if aggregation pipeline used
journalctl -u tasksTrackerApi | grep "DashboardServiceOptimized"

# Check MongoDB query profiling
mongosh "mongodb://localhost:27017/tasks-tracker" --eval "
  db.setProfilingLevel(2);
  db.system.profile.find({ ns: 'tasks-tracker.groups' }).sort({ ts: -1 }).limit(5).pretty();
"
```

**Solution:**
- Verify indexes created: `db.groups.getIndexes()`
- Check MongoDB server resources (CPU, memory)
- Increase aggregation pipeline batch size

---

## Success Criteria

### Technical Success
- ✅ Migration completes without errors
- ✅ All indexes created successfully
- ✅ Application starts and passes health checks
- ✅ P95 latency <100ms at 100% rollout
- ✅ Cache hit rate >70% after 1 hour
- ✅ Zero critical bugs introduced

### Business Success
- ✅ User satisfaction scores unchanged or improved
- ✅ No increase in support tickets related to dashboard
- ✅ Backend server costs reduced (fewer database queries)
- ✅ Dashboard feels faster to users (subjective feedback)

---

## Contacts

**On-Call Engineer:** [Your Team's On-Call]  
**Database Admin:** [DBA Contact]  
**Product Owner:** [PO Contact]  

**Emergency Rollback Authority:** Engineering Lead

---

**Document Version History:**
- v1.0 (Dec 17, 2025): Initial deployment runbook for FR-024
