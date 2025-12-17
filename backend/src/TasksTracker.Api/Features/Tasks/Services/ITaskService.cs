using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Features.Tasks.Models;

namespace TasksTracker.Api.Features.Tasks.Services;

public interface ITaskService
{
    Task<string> CreateAsync(CreateTaskRequest request, string currentUserId, bool isAdmin, CancellationToken ct);
    Task<PagedResult<TaskResponse>> ListAsync(TaskListQuery query, CancellationToken ct);
    Task AssignTaskAsync(string taskId, string assigneeUserId, string requestingUserId, CancellationToken ct);
    Task UnassignTaskAsync(string taskId, string requestingUserId, CancellationToken ct);
}