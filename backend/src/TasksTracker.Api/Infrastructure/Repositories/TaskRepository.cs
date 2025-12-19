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

    public async Task<(List<TaskItem> items, long total)> FindUserTasksAsync(
        string userId,
        int? difficulty,
        Core.Domain.TaskStatus? status,
        string sortBy,
        string sortOrder,
        int page,
        int pageSize,
        CancellationToken ct)
    {
        // Build filter for user's assigned tasks
        var filter = Builders<TaskItem>.Filter.Eq(x => x.AssignedUserId, userId);

        // Add difficulty filter if provided
        if (difficulty.HasValue)
        {
            filter &= Builders<TaskItem>.Filter.Eq(x => x.Difficulty, difficulty.Value);
        }

        // Add status filter if provided
        if (status.HasValue)
        {
            filter &= Builders<TaskItem>.Filter.Eq(x => x.Status, status.Value);
        }

        // Build sort definition
        SortDefinition<TaskItem> sortDefinition = sortBy.ToLower() switch
        {
            "difficulty" => sortOrder.ToLower() == "desc"
                ? Builders<TaskItem>.Sort.Descending(x => x.Difficulty)
                : Builders<TaskItem>.Sort.Ascending(x => x.Difficulty),
            "status" => sortOrder.ToLower() == "desc"
                ? Builders<TaskItem>.Sort.Descending(x => x.Status)
                : Builders<TaskItem>.Sort.Ascending(x => x.Status),
            _ => sortOrder.ToLower() == "desc" // default to dueDate
                ? Builders<TaskItem>.Sort.Descending(x => x.DueAt)
                : Builders<TaskItem>.Sort.Ascending(x => x.DueAt)
        };

        var find = _collection.Find(filter);
        var total = await find.CountDocumentsAsync(ct);

        var items = await find
            .Sort(sortDefinition)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }
}