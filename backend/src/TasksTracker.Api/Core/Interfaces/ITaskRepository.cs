using TasksTracker.Api.Core.Domain;

namespace TasksTracker.Api.Core.Interfaces;

public interface ITaskRepository
{
    Task<string> CreateAsync(TaskItem task, CancellationToken ct);
    Task<(List<TaskItem> items, long total)> FindAsync(
        string? groupId,
        TaskStatus? status,
        string? assignedTo,
        string? categoryId,
        int page,
        int pageSize,
        CancellationToken ct);
}