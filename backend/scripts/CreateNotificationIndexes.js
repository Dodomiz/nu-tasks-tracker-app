// MongoDB Index Creation Script for Notifications Collection
// Run this script using MongoDB shell or MongoDB Compass

// Switch to your database
use tasksTrackerDb;

// Create compound index on UserId and CreatedAt (for fetching user notifications sorted by date)
db.notifications.createIndex(
    { "UserId": 1, "CreatedAt": -1 },
    { name: "idx_userid_createdat", background: true }
);

// Create compound index on UserId, IsRead, and CreatedAt (for filtering unread notifications)
db.notifications.createIndex(
    { "UserId": 1, "IsRead": 1, "CreatedAt": -1 },
    { name: "idx_userid_isread_createdat", background: true }
);

// Optional: TTL index to auto-delete old notifications after 90 days
// Uncomment the following lines if you want automatic cleanup of old notifications
/*
db.notifications.createIndex(
    { "CreatedAt": 1 },
    { name: "idx_createdat_ttl", expireAfterSeconds: 7776000, background: true } // 90 days
);
*/

// Verify indexes created successfully
db.notifications.getIndexes();

print("Notification indexes created successfully!");
