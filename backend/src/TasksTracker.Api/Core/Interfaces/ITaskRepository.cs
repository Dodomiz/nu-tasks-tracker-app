using TasksTracker.Api.Core.Domain;

namespace TasksTracker.Api.Core.Interfaces;

public interface ITaskRepository
{
    Task<string> CreateAsync(TaskItem task, CancellationToken ct);
    Task<(List<TaskItem> items, long total)> FindAsync(
        string? groupId,
        Core.Domain.TaskStatus? status,
        string? assignedTo,
        string? categoryId,
        int page,
        int pageSize,
        CancellationToken ct);
    Task<TaskItem?> GetByIdAsync(string id, CancellationToken ct = default);
    Task UpdateAsync(TaskItem task, CancellationToken ct = default);
}