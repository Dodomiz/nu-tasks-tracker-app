using MongoDB.Driver;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Core.Interfaces;
using TasksTracker.Api.Infrastructure.Data;

namespace TasksTracker.Api.Infrastructure.Repositories;

public class TaskHistoryRepository(MongoDbContext context) : BaseRepository<TaskHistory>(context, "taskHistories"), ITaskHistoryRepository
{
    public async Task<List<TaskHistory>> GetByTaskIdAsync(string taskId, CancellationToken ct = default)
    {
        var filter = Builders<TaskHistory>.Filter.Eq(h => h.TaskId, taskId);
        return await _collection
            .Find(filter)
            .SortByDescending(h => h.ChangedAt)
            .ToListAsync(ct);
    }

    public async Task<List<TaskHistory>> GetByGroupIdAsync(string groupId, int page = 1, int pageSize = 50, CancellationToken ct = default)
    {
        var filter = Builders<TaskHistory>.Filter.Eq(h => h.GroupId, groupId);
        var skip = (page - 1) * pageSize;
        
        return await _collection
            .Find(filter)
            .SortByDescending(h => h.ChangedAt)
            .Skip(skip)
            .Limit(pageSize)
            .ToListAsync(ct);
    }
}
