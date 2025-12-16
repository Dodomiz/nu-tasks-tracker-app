using MongoDB.Driver;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Core.Interfaces;

namespace TasksTracker.Api.Infrastructure.Repositories;

public class TaskRepository(IMongoDatabase database) : ITaskRepository
{
    private readonly IMongoCollection<TaskItem> _collection = database.GetCollection<TaskItem>("tasks");

    public async Task<string> CreateAsync(TaskItem task, CancellationToken ct)
    {
        await _collection.InsertOneAsync(task, cancellationToken: ct);
        return task.Id;
    }

    public async Task<(List<TaskItem> items, long total)> FindAsync(
        string? groupId,
        Core.Domain.TaskStatus? status,
        string? assignedTo,
        string? categoryId,
        int page,
        int pageSize,
        CancellationToken ct)
    {
        var filter = Builders<TaskItem>.Filter.Empty;

        if (!string.IsNullOrWhiteSpace(groupId))
            filter &= Builders<TaskItem>.Filter.Eq(x => x.GroupId, groupId);

        if (status.HasValue)
            filter &= Builders<TaskItem>.Filter.Eq(x => x.Status, status.Value);

        if (!string.IsNullOrWhiteSpace(assignedTo))
            filter &= Builders<TaskItem>.Filter.Eq(x => x.AssignedUserId, assignedTo);

        // categoryId is placeholder for future linkage; ignore if not present in TaskItem

        var find = _collection.Find(filter);

        var total = await find.CountDocumentsAsync(ct);

        var items = await find
            .Sort(Builders<TaskItem>.Sort.Ascending(x => x.DueAt))
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }

    public async Task<TaskItem?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _collection.Find(x => x.Id == id).FirstOrDefaultAsync(ct);
    }

    public async Task UpdateAsync(TaskItem task, CancellationToken ct = default)
    {
        await _collection.ReplaceOneAsync(x => x.Id == task.Id, task, cancellationToken: ct);
    }
}