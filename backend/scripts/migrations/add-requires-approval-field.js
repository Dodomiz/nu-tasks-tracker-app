// MongoDB Migration Script: Add RequiresApproval field to existing tasks
// Run this script using: node add-requires-approval-field.js

const { MongoClient } = require('mongodb');

// Configuration - update these values for your environment
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'TasksTracker';
const COLLECTION_NAME = 'Tasks';

async function migrateRequiresApprovalField() {
    const client = new MongoClient(MONGO_URI);

    try {
        console.log('Connecting to MongoDB...');
        await client.connect();
        console.log('✓ Connected to MongoDB');

        const db = client.db(DATABASE_NAME);
        const tasksCollection = db.collection(COLLECTION_NAME);

        // Count total tasks
        const totalTasks = await tasksCollection.countDocuments();
        console.log(`\nFound ${totalTasks} tasks in the database`);

        if (totalTasks === 0) {
            console.log('No tasks to migrate. Exiting.');
            return;
        }

        // Update all tasks that don't have the RequiresApproval field
        console.log('\nAdding RequiresApproval field to tasks...');
        const result = await tasksCollection.updateMany(
            { RequiresApproval: { $exists: false } }, // Only update documents missing the field
            { $set: { RequiresApproval: false } }      // Set default value to false
        );

        console.log(`\n✓ Migration completed successfully!`);
        console.log(`  - Matched: ${result.matchedCount} tasks`);
        console.log(`  - Modified: ${result.modifiedCount} tasks`);

        // Verify the migration
        const tasksWithApproval = await tasksCollection.countDocuments({ RequiresApproval: { $exists: true } });
        console.log(`\n✓ Verification: ${tasksWithApproval} tasks now have the RequiresApproval field`);

        if (tasksWithApproval !== totalTasks) {
            console.warn(`\n⚠ Warning: Not all tasks have the RequiresApproval field!`);
            console.warn(`  Expected: ${totalTasks}, Actual: ${tasksWithApproval}`);
        }

    } catch (error) {
        console.error('\n✗ Migration failed with error:', error.message);
        throw error;
    } finally {
        await client.close();
        console.log('\n✓ Database connection closed');
    }
}

// Run the migration
if (require.main === module) {
    migrateRequiresApprovalField()
        .then(() => {
            console.log('\n🎉 Migration process completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Migration process failed:', error);
            process.exit(1);
        });
}

module.exports = { migrateRequiresApprovalField };
