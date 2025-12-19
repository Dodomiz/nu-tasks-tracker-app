using TasksTracker.Api.Core.Domain;

namespace TasksTracker.Api.Core.Interfaces;

public interface ITaskRepository
{
    Task<string> CreateAsync(TaskItem task, CancellationToken ct);
    Task<(List<TaskItem> items, long total)> FindAsync(
        string? groupId,
        Domain.TaskStatus? status,
        string? assignedTo,
        string? categoryId,
        int page,
        int pageSize,
        CancellationToken ct);
    Task<TaskItem?> GetByIdAsync(string id, CancellationToken ct = default);
    Task UpdateAsync(TaskItem task, CancellationToken ct = default);
    
    /// <summary>
    /// Find tasks assigned to a specific user with filtering, sorting, and pagination
    /// </summary>
    Task<(List<TaskItem> items, long total)> FindUserTasksAsync(
        string userId,
        int? difficulty,
        Domain.TaskStatus? status,
        string sortBy,
        string sortOrder,
        int page,
        int pageSize,
        CancellationToken ct);
}