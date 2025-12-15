using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Core.Interfaces;
using TasksTracker.Api.Features.Tasks.Models;

namespace TasksTracker.Api.Features.Tasks.Services;

public class TaskService(ITaskRepository taskRepository) : ITaskService
{
    public async Task<string> CreateAsync(CreateTaskRequest request, string currentUserId, bool isAdmin, CancellationToken ct)
    {
        if (!isAdmin)
            throw new UnauthorizedAccessException("Only admins can create tasks.");

        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ArgumentException("Name is required.");

        if (request.Difficulty is < 1 or > 10)
            throw new ArgumentException("Difficulty must be between 1 and 10.");

        var task = new TaskItem
        {
            GroupId = request.GroupId,
            AssignedUserId = request.AssignedUserId,
            TemplateId = request.TemplateId,
            Name = request.Name,
            Description = request.Description,
            Difficulty = request.Difficulty,
            DueAt = request.DueAt,
            Frequency = request.Frequency,
            CreatedByUserId = currentUserId
        };

        return await taskRepository.CreateAsync(task, ct);
    }

    public async Task<PagedResult<TaskResponse>> ListAsync(TaskListQuery query, CancellationToken ct)
    {
        var (items, total) = await taskRepository.FindAsync(
            query.GroupId,
            query.Status,
            query.AssignedTo,
            query.CategoryId,
            query.Page,
            query.PageSize,
            ct);

        var nowUtc = DateTime.UtcNow;
        var mapped = items.Select(t => new TaskResponse
        {
            Id = t.Id,
            GroupId = t.GroupId,
            AssignedUserId = t.AssignedUserId,
            TemplateId = t.TemplateId,
            Name = t.Name,
            Description = t.Description,
            Difficulty = t.Difficulty,
            Status = t.Status,
            DueAt = t.DueAt,
            IsOverdue = t.Status != TaskStatus.Completed && t.DueAt < nowUtc
        }).ToList();

        return new PagedResult<TaskResponse>
        {
            Page = query.Page,
            PageSize = query.PageSize,
            Total = total,
            Items = mapped
        };
    }
}