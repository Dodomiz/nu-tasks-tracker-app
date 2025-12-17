// FR-024: Groups Dashboard Migration Script
// Purpose: Add taskCount and lastActivity fields to Groups collection
// Run: mongosh <connection_string> --file migrate-groups-dashboard.js
// Created: December 17, 2025

print("===== FR-024 Groups Dashboard Migration =====");
print("Starting migration at: " + new Date().toISOString());
print("");

// Get database connection
const db = db.getSiblingDB('tasksTracker');

// Step 1: Backup count before migration
print("Step 1: Pre-migration validation");
const totalGroups = db.groups.countDocuments({});
print(`  - Total groups: ${totalGroups}`);

const groupsWithTaskCount = db.groups.countDocuments({ taskCount: { $exists: true } });
print(`  - Groups with taskCount field: ${groupsWithTaskCount}`);

const groupsWithLastActivity = db.groups.countDocuments({ lastActivity: { $exists: true } });
print(`  - Groups with lastActivity field: ${groupsWithLastActivity}`);
print("");

// Step 2: Add taskCount field (backfill from task count)
print("Step 2: Backfilling taskCount field...");
const startTaskCount = new Date();

const groups = db.groups.find({}, { _id: 1 }).toArray();
let taskCountUpdated = 0;

for (const group of groups) {
    const taskCount = db.tasks.countDocuments({ groupId: group._id.toString() });
    
    db.groups.updateOne(
        { _id: group._id },
        { 
            $set: { 
                taskCount: taskCount,
                schemaVersion: 2
            } 
        }
    );
    
    taskCountUpdated++;
    
    if (taskCountUpdated % 100 === 0) {
        print(`  - Progress: ${taskCountUpdated}/${totalGroups} groups updated`);
    }
}

const taskCountDuration = (new Date() - startTaskCount) / 1000;
print(`  - Completed: ${taskCountUpdated} groups updated in ${taskCountDuration.toFixed(2)}s`);
print("");

// Step 3: Add lastActivity field (use updatedAt or current time)
print("Step 3: Backfilling lastActivity field...");
const startLastActivity = new Date();

const result = db.groups.updateMany(
    {},
    [
        {
            $set: {
                lastActivity: {
                    $ifNull: ["$updatedAt", new Date()]
                },
                schemaVersion: 2
            }
        }
    ]
);

const lastActivityDuration = (new Date() - startLastActivity) / 1000;
print(`  - Completed: ${result.modifiedCount} groups updated in ${lastActivityDuration.toFixed(2)}s`);
print("");

// Step 4: Create indexes
print("Step 4: Creating indexes...");
const startIndexes = new Date();

// Index for dashboard query: filter by user + sort by lastActivity
print("  - Creating index: { 'members.userId': 1, 'lastActivity': -1 }");
db.groups.createIndex(
    { "members.userId": 1, "lastActivity": -1 },
    { background: true, name: "idx_members_userId_lastActivity" }
);

// Index for task filtering by group
print("  - Creating index: { 'groupId': 1, 'status': 1 }");
db.tasks.createIndex(
    { "groupId": 1, "status": 1 },
    { background: true, name: "idx_groupId_status" }
);

const indexesDuration = (new Date() - startIndexes) / 1000;
print(`  - Completed: Indexes created in ${indexesDuration.toFixed(2)}s`);
print("");

// Step 5: Verification
print("Step 5: Post-migration verification");

const groupsWithTaskCountAfter = db.groups.countDocuments({ taskCount: { $exists: true } });
print(`  - Groups with taskCount field: ${groupsWithTaskCountAfter}/${totalGroups}`);

const groupsWithLastActivityAfter = db.groups.countDocuments({ lastActivity: { $exists: true } });
print(`  - Groups with lastActivity field: ${groupsWithLastActivityAfter}/${totalGroups}`);

const groupsWithSchemaV2 = db.groups.countDocuments({ schemaVersion: 2 });
print(`  - Groups with schemaVersion 2: ${groupsWithSchemaV2}/${totalGroups}`);

// Check indexes
const groupIndexes = db.groups.getIndexes();
const hasUserActivityIndex = groupIndexes.some(idx => idx.name === "idx_members_userId_lastActivity");
print(`  - Index 'idx_members_userId_lastActivity' created: ${hasUserActivityIndex}`);

const taskIndexes = db.tasks.getIndexes();
const hasGroupStatusIndex = taskIndexes.some(idx => idx.name === "idx_groupId_status");
print(`  - Index 'idx_groupId_status' created: ${hasGroupStatusIndex}`);
print("");

// Step 6: Sample data validation
print("Step 6: Sample data validation");
const sampleGroup = db.groups.findOne({});
if (sampleGroup) {
    print("  - Sample group:");
    print(`      _id: ${sampleGroup._id}`);
    print(`      name: ${sampleGroup.name}`);
    print(`      taskCount: ${sampleGroup.taskCount}`);
    print(`      lastActivity: ${sampleGroup.lastActivity}`);
    print(`      schemaVersion: ${sampleGroup.schemaVersion}`);
}
print("");

// Summary
const totalDuration = ((new Date() - new Date(startTaskCount)) / 1000).toFixed(2);
print("===== Migration Complete =====");
print(`Total duration: ${totalDuration}s`);
print(`Groups migrated: ${totalGroups}`);
print(`Status: ${groupsWithTaskCountAfter === totalGroups && groupsWithLastActivityAfter === totalGroups ? 'SUCCESS' : 'PARTIAL'}`);
print("Migration completed at: " + new Date().toISOString());
print("");

// Rollback instructions
print("===== Rollback Instructions (if needed) =====");
print("To rollback this migration:");
print("1. Drop indexes:");
print("   db.groups.dropIndex('idx_members_userId_lastActivity')");
print("   db.tasks.dropIndex('idx_groupId_status')");
print("2. Remove added fields:");
print("   db.groups.updateMany({}, { $unset: { taskCount: '', lastActivity: '' }, $set: { schemaVersion: 1 } })");
print("3. Restore from backup if needed:");
print("   mongorestore --drop --nsInclude='tasksTracker.groups' /path/to/backup");
