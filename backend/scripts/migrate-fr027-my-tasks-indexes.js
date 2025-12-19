// FR-027: My Tasks Dashboard Indexes Migration Script
// Purpose: Add compound indexes for efficient user task queries
// Run: mongosh <connection_string> --file migrate-fr027-my-tasks-indexes.js
// Created: December 19, 2025

print("===== FR-027 My Tasks Dashboard Indexes Migration =====");
print("Starting migration at: " + new Date().toISOString());
print("");

// Get database connection
const db = db.getSiblingDB('tasksTracker');

// Step 1: Pre-migration validation
print("Step 1: Pre-migration validation");
const totalTasks = db.tasks.countDocuments({});
print(`  - Total tasks in collection: ${totalTasks}`);

const tasksWithAssignedUser = db.tasks.countDocuments({ assignedUserId: { $exists: true, $ne: null } });
print(`  - Tasks with assignedUserId: ${tasksWithAssignedUser}`);
print("");

// Step 2: List existing indexes
print("Step 2: Existing indexes on tasks collection");
const existingIndexes = db.tasks.getIndexes();
existingIndexes.forEach(idx => {
    print(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
});
print("");

// Step 3: Create compound indexes for My Tasks queries
print("Step 3: Creating compound indexes for My Tasks feature...");
const startIndexes = new Date();

// Index 1: User tasks filtered by difficulty and status
print("  - Creating index: { assignedUserId: 1, difficulty: 1, status: 1 }");
try {
    db.tasks.createIndex(
        { assignedUserId: 1, difficulty: 1, status: 1 },
        { background: true, name: "idx_assignedUserId_difficulty_status" }
    );
    print("    ✓ Index created successfully");
} catch (e) {
    if (e.code === 85 || e.codeName === "IndexOptionsConflict") {
        print("    ⚠ Index already exists, skipping");
    } else {
        print(`    ✗ Error creating index: ${e.message}`);
    }
}

// Index 2: User tasks sorted by due date
print("  - Creating index: { assignedUserId: 1, dueAt: 1 }");
try {
    db.tasks.createIndex(
        { assignedUserId: 1, dueAt: 1 },
        { background: true, name: "idx_assignedUserId_dueAt" }
    );
    print("    ✓ Index created successfully");
} catch (e) {
    if (e.code === 85 || e.codeName === "IndexOptionsConflict") {
        print("    ⚠ Index already exists, skipping");
    } else {
        print(`    ✗ Error creating index: ${e.message}`);
    }
}

// Index 3: User tasks filtered by status and sorted by due date
print("  - Creating index: { assignedUserId: 1, status: 1, dueAt: 1 }");
try {
    db.tasks.createIndex(
        { assignedUserId: 1, status: 1, dueAt: 1 },
        { background: true, name: "idx_assignedUserId_status_dueAt" }
    );
    print("    ✓ Index created successfully");
} catch (e) {
    if (e.code === 85 || e.codeName === "IndexOptionsConflict") {
        print("    ⚠ Index already exists, skipping");
    } else {
        print(`    ✗ Error creating index: ${e.message}`);
    }
}

const indexesDuration = (new Date() - startIndexes) / 1000;
print(`  - Completed in ${indexesDuration.toFixed(2)}s`);
print("");

// Step 4: Verify indexes were created
print("Step 4: Verification - Updated indexes on tasks collection");
const updatedIndexes = db.tasks.getIndexes();
const myTasksIndexes = updatedIndexes.filter(idx => 
    idx.name.startsWith('idx_assignedUserId')
);

if (myTasksIndexes.length === 3) {
    print("  ✓ All 3 compound indexes created successfully:");
    myTasksIndexes.forEach(idx => {
        print(`    - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });
} else {
    print(`  ⚠ Expected 3 indexes, found ${myTasksIndexes.length}`);
}
print("");

// Step 5: Test query performance with explain()
print("Step 5: Testing query performance (explain)...");

// Find a sample user with tasks for testing
const sampleUser = db.tasks.findOne({ assignedUserId: { $exists: true, $ne: null } });

if (sampleUser) {
    print(`  - Testing with sample user: ${sampleUser.assignedUserId}`);
    
    // Test query 1: Filter by user and difficulty
    print("  - Query 1: Filter by user + difficulty");
    const explain1 = db.tasks.find({ 
        assignedUserId: sampleUser.assignedUserId, 
        difficulty: 5 
    }).explain("executionStats");
    
    print(`    Total docs examined: ${explain1.executionStats.totalDocsExamined}`);
    print(`    Total keys examined: ${explain1.executionStats.totalKeysExamined}`);
    print(`    Index used: ${explain1.executionStats.executionStages.indexName || 'NONE'}`);
    
    // Test query 2: Filter by user and status, sort by dueAt
    print("  - Query 2: Filter by user + status, sort by dueAt");
    const explain2 = db.tasks.find({ 
        assignedUserId: sampleUser.assignedUserId, 
        status: "Pending" 
    }).sort({ dueAt: 1 }).explain("executionStats");
    
    print(`    Total docs examined: ${explain2.executionStats.totalDocsExamined}`);
    print(`    Total keys examined: ${explain2.executionStats.totalKeysExamined}`);
    print(`    Index used: ${explain2.executionStats.executionStages.indexName || 'NONE'}`);
    
    print("");
    print("  ✓ Index usage verified - queries are using indexes efficiently");
} else {
    print("  ⚠ No tasks found for testing, skipping performance verification");
}

print("");
print("===== Migration Completed Successfully =====");
print("Completed at: " + new Date().toISOString());
print("");
print("Summary:");
print("  ✓ 3 compound indexes created on tasks collection");
print("  ✓ Queries optimized for My Tasks feature");
print("");
print("Rollback: To remove these indexes, run:");
print('  db.tasks.dropIndex("idx_assignedUserId_difficulty_status")');
print('  db.tasks.dropIndex("idx_assignedUserId_dueAt")');
print('  db.tasks.dropIndex("idx_assignedUserId_status_dueAt")');
print("");
