using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Features.Tasks.Models;

namespace TasksTracker.Api.Features.Tasks.Services;

public interface ITaskService
{
    Task<string> CreateAsync(CreateTaskRequest request, string currentUserId, bool isAdmin, CancellationToken ct);
    Task<PagedResult<TaskResponse>> ListAsync(TaskListQuery query, CancellationToken ct);
    Task AssignTaskAsync(string taskId, string assigneeUserId, string requestingUserId, CancellationToken ct);
    Task UnassignTaskAsync(string taskId, string requestingUserId, CancellationToken ct);
    Task UpdateTaskStatusAsync(string taskId, Core.Domain.TaskStatus newStatus, string requestingUserId, CancellationToken ct);
    Task UpdateTaskAsync(string taskId, UpdateTaskRequest request, string requestingUserId, CancellationToken ct);
    
    /// <summary>
    /// Get all tasks assigned to a user across all groups with filtering and sorting
    /// </summary>
    Task<PagedResult<TaskWithGroupDto>> GetUserTasksAsync(string userId, MyTasksQuery query, CancellationToken ct);
    
    /// <summary>
    /// Get history of changes for a specific task
    /// </summary>
    Task<List<TaskHistoryResponse>> GetTaskHistoryAsync(string taskId, string requestingUserId, CancellationToken ct);
}