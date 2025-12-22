using TasksTracker.Api.Core.Domain;

namespace TasksTracker.Api.Core.Interfaces;

public interface ITaskHistoryRepository : IRepository<TaskHistory>
{
    Task<List<TaskHistory>> GetByTaskIdAsync(string taskId, CancellationToken ct = default);
    Task<List<TaskHistory>> GetByGroupIdAsync(string groupId, int page = 1, int pageSize = 50, CancellationToken ct = default);
}
