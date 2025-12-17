// MongoDB Migration Rollback Script for FR-024 Dashboard Optimizations
// Run with: mongosh "mongodb://localhost:27017/tasks-tracker" rollback-fr024-dashboard.js

print("=".repeat(80));
print("FR-024 Dashboard Migration Rollback");
print("=".repeat(80));

const db = db.getSiblingDB('tasks-tracker');

// Backup collection name
const backupCollectionName = 'groups_backup_fr024';

print("\n[1/4] Checking for backup collection...");
const collections = db.getCollectionNames();
if (!collections.includes(backupCollectionName)) {
    print(`❌ ERROR: Backup collection '${backupCollectionName}' not found!`);
    print("Cannot rollback without backup. Aborting.");
    quit(1);
}

print(`✅ Backup collection found: ${backupCollectionName}`);

const backupCount = db[backupCollectionName].countDocuments();
print(`   Backup contains ${backupCount} groups`);

print("\n[2/4] Dropping indexes created by FR-024...");

try {
    // Drop FR-024 indexes
    db.groups.dropIndex("idx_members_userId_lastActivity");
    print("✅ Dropped index: idx_members_userId_lastActivity");
} catch (e) {
    print(`⚠️  Index idx_members_userId_lastActivity may not exist: ${e.message}`);
}

try {
    db.groups.dropIndex("idx_members_userId_role");
    print("✅ Dropped index: idx_members_userId_role");
} catch (e) {
    print(`⚠️  Index idx_members_userId_role may not exist: ${e.message}`);
}

try {
    db.groups.dropIndex("idx_taskCount");
    print("✅ Dropped index: idx_taskCount");
} catch (e) {
    print(`⚠️  Index idx_taskCount may not exist: ${e.message}`);
}

print("\n[3/4] Removing FR-024 fields from groups collection...");

const removeFieldsResult = db.groups.updateMany(
    { schemaVersion: 2 },
    {
        $unset: {
            taskCount: "",
            lastActivity: "",
            schemaVersion: ""
        }
    }
);

print(`✅ Removed FR-024 fields from ${removeFieldsResult.modifiedCount} groups`);

print("\n[4/4] Verifying rollback...");

const remainingWithSchema2 = db.groups.countDocuments({ schemaVersion: 2 });
const remainingWithTaskCount = db.groups.countDocuments({ taskCount: { $exists: true } });
const remainingWithLastActivity = db.groups.countDocuments({ lastActivity: { $exists: true } });

if (remainingWithSchema2 > 0 || remainingWithTaskCount > 0 || remainingWithLastActivity > 0) {
    print("⚠️  WARNING: Some groups still have FR-024 fields!");
    print(`   Groups with schemaVersion=2: ${remainingWithSchema2}`);
    print(`   Groups with taskCount: ${remainingWithTaskCount}`);
    print(`   Groups with lastActivity: ${remainingWithLastActivity}`);
} else {
    print("✅ Rollback verification passed - all FR-024 fields removed");
}

print("\n[OPTIONAL] To restore from backup, run:");
print(`   db.groups.drop()`);
print(`   db.${backupCollectionName}.renameCollection('groups')`);

print("\n=".repeat(80));
print("Rollback Complete");
print("=".repeat(80));
print("\nNext Steps:");
print("1. Verify application still works with old schema");
print("2. Set FeatureFlags.DashboardOptimizations = false in appsettings.json");
print("3. Restart application servers");
print("4. Monitor logs for errors");
print(`5. Keep backup collection '${backupCollectionName}' for 7 days before dropping`);
