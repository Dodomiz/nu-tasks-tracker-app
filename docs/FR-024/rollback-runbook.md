# FR-024 Dashboard Optimizations - Rollback Runbook

**Version:** 1.0  
**Last Updated:** December 17, 2025  
**Emergency Contact:** Engineering On-Call  
**Estimated Rollback Time:** 5-15 minutes

---

## When to Rollback

### Critical Severity (Immediate Rollback Required)
- ❌ **Error rate >10%** compared to pre-deployment baseline
- ❌ **Dashboard completely broken** (500 errors, no data displayed)
- ❌ **Data corruption detected** (taskCount incorrect, missing groups)
- ❌ **Database performance degraded** (MongoDB CPU >90%, queries timing out)
- ❌ **Application crashes** (continuous restarts, OOM errors)

### High Severity (Rollback Recommended)
- ⚠️ **Error rate 5-10%** sustained for >15 minutes
- ⚠️ **P95 latency >500ms** sustained for >15 minutes
- ⚠️ **Cache failures causing degraded experience** for >30% of users
- ⚠️ **User reports of data inconsistencies** (stale task counts, missing groups)

### Medium Severity (Consider Partial Rollback)
- 🟡 **P95 latency 200-500ms** (optimization not helping)
- 🟡 **Cache hit rate <30%** after 2 hours of warmup
- 🟡 **Increased memory usage** (>50% increase, no leak detected)
- 🟡 **Gradual rollout stalled** at <70% due to minor issues

---

## Rollback Decision Tree

```
Is the dashboard completely broken (500 errors)?
├─ YES → Full Rollback (Scenario 1)
└─ NO → Is error rate >10% or data corrupted?
    ├─ YES → Full Rollback (Scenario 1)
    └─ NO → Is performance degraded but functional?
        ├─ YES → Partial Rollback (Scenario 2)
        └─ NO → Monitor and investigate (Scenario 3)
```

---

## Rollback Scenarios

### Scenario 1: Full Rollback (Application + Database)

**Use When:** Dashboard completely broken, data corruption, critical errors

**Estimated Time:** 15 minutes

#### Step 1: Disable Feature Flag (Immediate - 1 minute)
```bash
# SSH to application server
ssh user@app-server

# Edit configuration
sudo nano /publish/fr024/appsettings.json

# Set feature flag to 0
"FeatureFlags": {
  "DashboardOptimizations": 0
}

# Restart application
sudo systemctl restart tasksTrackerApi

# Verify restart
sudo systemctl status tasksTrackerApi
```

**Success Criteria:** Application starts, logs show "DashboardOptimizations = 0%"

---

#### Step 2: Verify Fallback to Old Dashboard (2 minutes)
```bash
# Test dashboard endpoint
curl -H "Authorization: Bearer $USER_TOKEN" \
  http://localhost:5000/api/dashboard?page=1&pageSize=10

# Check response structure (should use old DashboardService)
# Old service doesn't have aggregation pipeline logs
sudo journalctl -u tasksTrackerApi -n 100 | grep -i "aggregation"
# Should return no results
```

**Success Criteria:** Dashboard returns data, error rate drops to baseline

---

#### Step 3: Rollback Database Migration (10 minutes)
```bash
# SSH to database server
ssh user@db-server

# Navigate to scripts
cd /path/to/backend/scripts

# Run rollback script
mongosh "mongodb://localhost:27017/tasks-tracker" rollback-fr024-dashboard.js

# Verify rollback
mongosh "mongodb://localhost:27017/tasks-tracker" --eval "
  print('Groups with schemaVersion=2:', db.groups.countDocuments({ schemaVersion: 2 }));
  print('Groups with taskCount:', db.groups.countDocuments({ taskCount: { \$exists: true } }));
  print('Groups with lastActivity:', db.groups.countDocuments({ lastActivity: { \$exists: true } }));
"
# All counts should be 0
```

**Success Criteria:** All FR-024 fields removed, old schema restored

---

#### Step 4: Verify System Health (2 minutes)
```bash
# Health check
curl http://localhost:5000/health

# Get metrics summary
curl http://localhost:5000/api/dashboard/metrics/summary

# Check error rate (should be back to baseline)
sudo journalctl -u tasksTrackerApi --since "10 minutes ago" | grep -i error | wc -l
```

**Success Criteria:**
- ✅ Health check returns Healthy
- ✅ Error rate <5 per minute
- ✅ Dashboard queries working for all users

---

### Scenario 2: Partial Rollback (Feature Flag Only)

**Use When:** Performance degraded but no data corruption, minor issues

**Estimated Time:** 5 minutes

#### Step 1: Reduce Rollout Percentage
```bash
# If at 100%, reduce to 50%
# If at 70%, reduce to 30%
# If at 30%, reduce to 10%
# If at 10%, reduce to 0%

sudo nano /publish/fr024/appsettings.json

"FeatureFlags": {
  "DashboardOptimizations": 10  # Or 0 for complete disable
}

sudo systemctl restart tasksTrackerApi
```

**Success Criteria:** Fewer users affected, issue contained

---

#### Step 2: Monitor for 10 Minutes
```bash
# Watch metrics in real-time
watch -n 30 'curl -s http://localhost:5000/api/dashboard/metrics/summary | jq "{totalRequests, cacheHitRate, p95DurationMs}"'

# Watch error logs
sudo journalctl -u tasksTrackerApi -f | grep -i error
```

**Decision Point:**
- **If issues resolved:** Keep at reduced percentage, investigate root cause
- **If issues persist:** Reduce to 0% or proceed to Scenario 1 (full rollback)

---

### Scenario 3: Cache-Only Rollback (Redis Issues)

**Use When:** Redis failures, cache errors, in-memory fallback not working

**Estimated Time:** 2 minutes

#### Step 1: Disable Redis, Force In-Memory Cache
```bash
sudo nano /publish/fr024/appsettings.json

"ConnectionStrings": {
  "Redis": ""  # Empty string forces in-memory cache
}

sudo systemctl restart tasksTrackerApi
```

**Success Criteria:** Logs show "Using in-memory cache fallback"

---

#### Step 2: Verify In-Memory Cache Working
```bash
# Make two identical requests
curl -H "Authorization: Bearer $USER_TOKEN" http://localhost:5000/api/dashboard
curl -H "Authorization: Bearer $USER_TOKEN" http://localhost:5000/api/dashboard

# Check metrics (should show cache hits)
curl http://localhost:5000/api/dashboard/metrics/summary | jq '.cacheHitRate'
```

**Success Criteria:** Cache hit rate >0%, no Redis errors in logs

---

## Post-Rollback Actions

### Immediate (Within 1 Hour)

#### 1. Notify Stakeholders
```
Subject: FR-024 Dashboard Optimizations Rolled Back

Hi Team,

We've rolled back the FR-024 dashboard optimizations due to [REASON].

Current Status:
- Dashboard: Working on old implementation
- Impact: [X] users affected during rollback
- Root Cause: [Brief description]
- Next Steps: [Investigation plan]

ETA for Resolution: [Estimate]

[Your Name]
Engineering Team
```

#### 2. Preserve Logs for Investigation
```bash
# Copy logs to investigation directory
sudo journalctl -u tasksTrackerApi --since "2 hours ago" > /tmp/fr024-rollback-logs.txt

# Export MongoDB slow queries
mongosh "mongodb://localhost:27017/tasks-tracker" --eval "
  db.system.profile.find({ millis: { \$gt: 100 } }).sort({ ts: -1 }).limit(100);
" > /tmp/fr024-mongodb-slow-queries.txt

# Export metrics snapshot
curl http://localhost:5000/api/dashboard/metrics/raw?lastMinutes=60 > /tmp/fr024-metrics.json
```

#### 3. Update Monitoring Alerts
```bash
# Temporarily increase alert thresholds to avoid noise
# Dashboard is on old implementation, expect higher latency

# Update alert: P95 latency
# Old threshold: 100ms
# New threshold: 300ms (baseline for old implementation)
```

---

### Short-Term (Within 24 Hours)

#### 4. Root Cause Analysis
- [ ] Review error logs for patterns
- [ ] Analyze slow queries in MongoDB profiler
- [ ] Check metrics for anomalies (cache hit rate, error rate)
- [ ] Reproduce issue in staging environment
- [ ] Identify specific code change causing issue

#### 5. Fix Development
- [ ] Create hotfix branch: `hotfix/fr024-rollback-fix`
- [ ] Implement fix based on RCA findings
- [ ] Add regression tests
- [ ] Deploy to staging for validation

#### 6. Staging Re-Deployment
- [ ] Deploy fix to staging
- [ ] Run full test suite
- [ ] Load test with 100 concurrent users
- [ ] Monitor for 24 hours in staging

---

### Long-Term (Within 1 Week)

#### 7. Retrospective
- [ ] Schedule post-mortem meeting
- [ ] Document lessons learned
- [ ] Update deployment runbook with new safeguards
- [ ] Improve monitoring/alerting to catch issues earlier

#### 8. Re-Deployment Plan
- [ ] Update rollout plan with stricter monitoring
- [ ] Add staged rollout checkpoints (10% → 24h → 30% → 24h → etc.)
- [ ] Prepare "kill switch" for instant rollback
- [ ] Schedule re-deployment with full team availability

---

## Rollback Verification Checklist

After any rollback, verify:

### Functional Checks
- [ ] Dashboard loads for users
- [ ] Group cards display correctly
- [ ] Task creation works
- [ ] Member list modal works
- [ ] Search/filter functionality works
- [ ] Pagination works

### Performance Checks
- [ ] Error rate <5 per minute
- [ ] P95 latency <500ms (old baseline)
- [ ] MongoDB CPU usage <60%
- [ ] Application memory usage stable

### Data Integrity Checks
- [ ] Task counts match reality (query `db.tasks.countDocuments({groupId: "..."})`)
- [ ] No groups missing from dashboard
- [ ] User roles correct (admin/member)
- [ ] Timestamps accurate

---

## Common Rollback Issues

### Issue: Application Won't Start After Rollback

**Error:** `FeatureNotFoundException: DashboardServiceOptimized not found`

**Solution:**
```bash
# Clear old assemblies
sudo rm -rf /publish/fr024/*.dll
sudo rm -rf /publish/fr024/*.pdb

# Re-deploy previous version
sudo cp -r /publish/tasksTrackerApi-v1.0/* /publish/fr024/
sudo systemctl restart tasksTrackerApi
```

---

### Issue: Database Rollback Script Fails

**Error:** `Backup collection not found`

**Solution:**
```bash
# Restore from full backup
mongorestore --uri="mongodb://localhost:27017" --drop /backup/fr024-pre-migration-*/

# Verify restore
mongosh "mongodb://localhost:27017/tasks-tracker" --eval "db.groups.countDocuments({})"
```

---

### Issue: Cache Still Using Old Data After Rollback

**Error:** Users seeing stale data (old task counts)

**Solution:**
```bash
# Clear Redis cache
redis-cli FLUSHDB

# Or clear specific keys
redis-cli KEYS "dashboard:*" | xargs redis-cli DEL

# Or restart application (clears in-memory cache)
sudo systemctl restart tasksTrackerApi
```

---

## Emergency Contacts

**Primary On-Call:** [Engineering On-Call Rotation]  
**Backup:** [Engineering Lead]  
**Database DBA:** [DBA Contact]  
**DevOps:** [DevOps Team]

**Slack Channels:**
- `#engineering-alerts`
- `#fr024-deployment`
- `#incident-response`

---

## Rollback Authority

**Authorized to Initiate Rollback:**
- On-Call Engineer
- Engineering Lead
- CTO

**No Approval Needed For:**
- Critical severity issues (dashboard completely broken)
- Security vulnerabilities

**Approval Required For:**
- Partial rollback during business hours (notify Product Owner)
- Database rollback (notify DBA first)

---

**Document Version History:**
- v1.0 (Dec 17, 2025): Initial rollback runbook for FR-024
