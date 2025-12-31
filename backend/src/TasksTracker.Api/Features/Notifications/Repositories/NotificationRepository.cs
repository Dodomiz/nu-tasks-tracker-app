using MongoDB.Driver;
using TasksTracker.Api.Core.Domain;

namespace TasksTracker.Api.Features.Notifications.Repositories;

public class NotificationRepository(IMongoDatabase database)
{
    private readonly IMongoCollection<Notification> _collection = database.GetCollection<Notification>("notifications");

    public async Task<string> CreateAsync(Notification notification, CancellationToken ct = default)
    {
        await _collection.InsertOneAsync(notification, cancellationToken: ct);
        return notification.Id;
    }

    public async Task<List<Notification>> GetByUserIdAsync(
        string userId,
        int skip = 0,
        int take = 50,
        CancellationToken ct = default)
    {
        return await _collection
            .Find(x => x.UserId == userId)
            .SortByDescending(x => x.CreatedAt)
            .Skip(skip)
            .Limit(take)
            .ToListAsync(ct);
    }

    public async Task<Notification?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _collection.Find(x => x.Id == id).FirstOrDefaultAsync(ct);
    }

    public async Task<int> GetUnreadCountAsync(string userId, CancellationToken ct = default)
    {
        var count = await _collection.CountDocumentsAsync(
            x => x.UserId == userId && !x.IsRead,
            cancellationToken: ct
        );
        return (int)count;
    }

    public async Task MarkAsReadAsync(string notificationId, CancellationToken ct = default)
    {
        var update = Builders<Notification>.Update.Set(x => x.IsRead, true);
        await _collection.UpdateOneAsync(
            x => x.Id == notificationId,
            update,
            cancellationToken: ct
        );
    }

    public async Task MarkAllAsReadAsync(string userId, CancellationToken ct = default)
    {
        var update = Builders<Notification>.Update.Set(x => x.IsRead, true);
        await _collection.UpdateManyAsync(
            x => x.UserId == userId && !x.IsRead,
            update,
            cancellationToken: ct
        );
    }
}
