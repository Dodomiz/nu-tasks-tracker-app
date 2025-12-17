# FR-024 Database Migration Guide

**Migration:** Add `taskCount` and `lastActivity` fields to Groups collection  
**Date:** December 17, 2025  
**Est. Duration:** 15 minutes for 10K groups  
**Risk Level:** Low (non-breaking, backward compatible)

---

## Pre-Migration Checklist

### 1. Backup Database
```bash
# Backup groups and tasks collections
mongodump --uri="mongodb://localhost:27017" --db=tasksTracker --collection=groups --out=/backup/before-fr024
mongodump --uri="mongodb://localhost:27017" --db=tasksTracker --collection=tasks --out=/backup/before-fr024

# Verify backup
ls -lh /backup/before-fr024/tasksTracker/
```

### 2. Verify Database Connection
```bash
mongosh "mongodb://localhost:27017/tasksTracker" --eval "db.groups.countDocuments({})"
```

### 3. Check Current Schema Version
```bash
mongosh "mongodb://localhost:27017/tasksTracker" --eval "db.groups.findOne({}, {schemaVersion: 1, _id: 0})"
```

Expected output: `{ schemaVersion: 1 }`

---

## Migration Execution

### Option 1: Run via MongoDB Shell (Recommended)
```bash
cd /path/to/my-tasks-tracker-app/backend/scripts

# Dry run (preview changes)
mongosh "mongodb://localhost:27017/tasksTracker" --file migrate-groups-dashboard.js --eval "const DRY_RUN = true"

# Production run
mongosh "mongodb://localhost:27017/tasksTracker" --file migrate-groups-dashboard.js > migration-output.log 2>&1

# Check output
cat migration-output.log
```

### Option 2: Run via Docker (if MongoDB is containerized)
```bash
docker cp backend/scripts/migrate-groups-dashboard.js mongodb-container:/tmp/
docker exec mongodb-container mongosh tasksTracker --file /tmp/migrate-groups-dashboard.js
```

---

## Expected Output

```
===== FR-024 Groups Dashboard Migration =====
Starting migration at: 2025-12-17T10:00:00.000Z

Step 1: Pre-migration validation
  - Total groups: 237
  - Groups with taskCount field: 0
  - Groups with lastActivity field: 0

Step 2: Backfilling taskCount field...
  - Progress: 100/237 groups updated
  - Progress: 200/237 groups updated
  - Completed: 237 groups updated in 3.45s

Step 3: Backfilling lastActivity field...
  - Completed: 237 groups updated in 0.12s

Step 4: Creating indexes...
  - Creating index: { 'members.userId': 1, 'lastActivity': -1 }
  - Creating index: { 'groupId': 1, 'status': 1 }
  - Completed: Indexes created in 1.23s

Step 5: Post-migration verification
  - Groups with taskCount field: 237/237
  - Groups with lastActivity field: 237/237
  - Groups with schemaVersion 2: 237/237
  - Index 'idx_members_userId_lastActivity' created: true
  - Index 'idx_groupId_status' created: true

Step 6: Sample data validation
  - Sample group:
      _id: 507f1f77bcf86cd799439011
      name: Family Tasks
      taskCount: 15
      lastActivity: 2025-12-15T14:30:00.000Z
      schemaVersion: 2

===== Migration Complete =====
Total duration: 4.80s
Groups migrated: 237
Status: SUCCESS
Migration completed at: 2025-12-17T10:00:05.000Z
```

---

## Post-Migration Verification

### 1. Check Field Values
```javascript
// Check taskCount distribution
db.groups.aggregate([
  {
    $group: {
      _id: null,
      avgTaskCount: { $avg: "$taskCount" },
      maxTaskCount: { $max: "$taskCount" },
      minTaskCount: { $min: "$taskCount" }
    }
  }
])

// Verify lastActivity is reasonable
db.groups.find(
  { lastActivity: { $gt: new Date("2025-01-01") } }
).count()
```

### 2. Verify Indexes
```javascript
// Check groups indexes
db.groups.getIndexes()

// Check index usage (after dashboard queries run)
db.groups.aggregate([
  { $indexStats: {} },
  { $match: { name: "idx_members_userId_lastActivity" } }
])
```

### 3. Test Dashboard Query Performance
```javascript
// Simulate dashboard query
db.groups.find(
  { "members.userId": "507f1f77bcf86cd799439011" }
).sort({ lastActivity: -1 }).limit(12).explain("executionStats")
```

Expected: `"executionStage": "IXSCAN"` (index scan, not COLLSCAN)

---

## Rollback Procedure

### If Migration Fails or Causes Issues

#### Step 1: Drop Indexes
```javascript
db.groups.dropIndex("idx_members_userId_lastActivity")
db.tasks.dropIndex("idx_groupId_status")
```

#### Step 2: Remove Added Fields
```javascript
db.groups.updateMany(
  {},
  {
    $unset: { taskCount: "", lastActivity: "" },
    $set: { schemaVersion: 1 }
  }
)
```

#### Step 3: Verify Rollback
```javascript
// Check schema version
db.groups.findOne({}, { schemaVersion: 1, taskCount: 1, lastActivity: 1 })

// Expected: { schemaVersion: 1 } (no taskCount/lastActivity)
```

#### Step 4: Restore from Backup (if needed)
```bash
mongorestore --drop --nsInclude="tasksTracker.groups" /backup/before-fr024
```

---

## Zero-Downtime Deployment Strategy

### Phase 1: Schema Extension (Non-Breaking)
1. Deploy backend code with new Group model fields (`taskCount`, `lastActivity`)
2. Run migration script during low-traffic period
3. Old code ignores new fields (backward compatible)
4. **Deployment window:** Anytime (no downtime)

### Phase 2: Feature Activation
1. Deploy dashboard frontend code
2. Enable feature flag: `FEATURE_GROUPS_DASHBOARD=true`
3. Monitor error rates and performance metrics
4. **Deployment window:** After migration verification

### Rollback Plan
- Phase 2 rollback: Disable feature flag → Old dashboard still works
- Phase 1 rollback: Run rollback procedure above

---

## Monitoring & Alerts

### Key Metrics to Watch Post-Migration
1. **Dashboard API latency:** Should be <200ms (p95)
2. **Error rate:** Should remain <1%
3. **Database CPU usage:** May spike during index creation (expected)
4. **Cache hit rate:** Should reach >70% within 1 hour

### Alert Thresholds
- Dashboard API p95 latency >500ms for 5 minutes → Page on-call
- Error rate >5% for 2 minutes → Page on-call
- MongoDB query time >1s → Warning (investigate slow queries)

---

## Troubleshooting

### Issue: Index Creation Times Out
**Symptom:** Script hangs at Step 4  
**Cause:** Large collection size, insufficient resources  
**Solution:**
```bash
# Cancel current script (Ctrl+C)
# Create indexes manually with lower priority
db.groups.createIndex(
  { "members.userId": 1, "lastActivity": -1 },
  { background: true, maxTimeMS: 3600000 }  // 1 hour timeout
)
```

### Issue: TaskCount Mismatch
**Symptom:** Dashboard shows incorrect task counts  
**Cause:** Tasks created during migration  
**Solution:**
```javascript
// Re-run taskCount backfill for affected groups
db.groups.find({}).forEach(group => {
  const correctCount = db.tasks.countDocuments({ groupId: group._id.toString() });
  if (group.taskCount !== correctCount) {
    db.groups.updateOne(
      { _id: group._id },
      { $set: { taskCount: correctCount } }
    );
    print(`Fixed ${group.name}: ${group.taskCount} → ${correctCount}`);
  }
});
```

### Issue: LastActivity Shows Future Dates
**Symptom:** Groups show "last active in X days"  
**Cause:** System clock skew or incorrect data  
**Solution:**
```javascript
// Find and fix future dates
db.groups.updateMany(
  { lastActivity: { $gt: new Date() } },
  { $set: { lastActivity: new Date() } }
)
```

---

## Success Criteria

- ✅ All groups have `taskCount` and `lastActivity` fields
- ✅ Schema version updated to 2
- ✅ Both indexes created successfully
- ✅ Sample queries use indexes (IXSCAN, not COLLSCAN)
- ✅ Migration completes in <15 minutes
- ✅ Zero data loss
- ✅ Backward compatibility maintained
