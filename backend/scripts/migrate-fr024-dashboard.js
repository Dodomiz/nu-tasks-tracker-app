// FR-024 Sprint 2: Database Migration Script for Dashboard Optimization
// Run this script against MongoDB to ensure all groups have required denormalized fields

print("===== FR-024 Dashboard Optimization Migration =====");
print("Starting migration at: " + new Date().toISOString());

const db = db.getSiblingDB('taskstracker');
const groupsCollection = db.getCollection('groups');
const tasksCollection = db.getCollection('tasks');

let migratedCount = 0;
let skippedCount = 0;
let errorCount = 0;

print("\nStep 1: Finding groups that need migration...");
const groupsToMigrate = groupsCollection.find({
  $or: [
    { taskCount: { $exists: false } },
    { lastActivity: { $exists: false } },
    { schemaVersion: { $lt: 2 } }
  ]
}).toArray();

print(`Found ${groupsToMigrate.length} groups to migrate`);

print("\nStep 2: Migrating groups...");
groupsToMigrate.forEach(group => {
  try {
    // Calculate task count for this group
    const taskCount = tasksCollection.countDocuments({ groupId: group._id.toString() });
    
    // Find last activity (most recent task update or creation)
    const lastTask = tasksCollection.findOne(
      { groupId: group._id.toString() },
      { sort: { updatedAt: -1 }, projection: { updatedAt: 1 } }
    );
    
    const lastActivity = lastTask?.updatedAt || group.updatedAt || group.createdAt || new Date();
    
    // Update the group document
    const result = groupsCollection.updateOne(
      { _id: group._id },
      {
        $set: {
          taskCount: taskCount,
          lastActivity: lastActivity,
          schemaVersion: 2,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      migratedCount++;
      print(`✓ Migrated group: ${group.name} (ID: ${group._id}) - ${taskCount} tasks`);
    } else {
      skippedCount++;
      print(`- Skipped group: ${group.name} (ID: ${group._id}) - already up to date`);
    }
  } catch (error) {
    errorCount++;
    print(`✗ Error migrating group ${group.name} (ID: ${group._id}): ${error.message}`);
  }
});

print("\n===== Migration Summary =====");
print(`Successfully migrated: ${migratedCount} groups`);
print(`Skipped (already migrated): ${skippedCount} groups`);
print(`Errors: ${errorCount} groups`);
print(`Completed at: ${new Date().toISOString()}`);

// Step 3: Create indexes for optimized queries
print("\nStep 3: Creating indexes for dashboard queries...");

try {
  // Compound index for user groups with sorting
  groupsCollection.createIndex(
    { "members.userId": 1, lastActivity: -1 },
    { name: "idx_members_userId_lastActivity", background: true }
  );
  print("✓ Created index: idx_members_userId_lastActivity");
  
  // Index for member lookups
  groupsCollection.createIndex(
    { "members.userId": 1, "members.role": 1 },
    { name: "idx_members_userId_role", background: true }
  );
  print("✓ Created index: idx_members_userId_role");
  
  // Index for task count queries (if needed)
  groupsCollection.createIndex(
    { taskCount: 1 },
    { name: "idx_taskCount", background: true }
  );
  print("✓ Created index: idx_taskCount");
  
  print("✓ All indexes created successfully");
} catch (error) {
  print(`✗ Error creating indexes: ${error.message}`);
}

print("\n===== Migration Complete =====");
