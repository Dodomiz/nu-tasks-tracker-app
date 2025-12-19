using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Core.Interfaces;
using TasksTracker.Api.Features.Tasks.Models;

namespace TasksTracker.Api.Features.Tasks.Services;

public class TaskService(
    ITaskRepository taskRepository,
    IGroupRepository groupRepository,
    IUserRepository userRepository) : ITaskService
{
    public async Task<string> CreateAsync(CreateTaskRequest request, string currentUserId, bool isAdmin, CancellationToken ct)
    {
        // Verify user is admin of THIS specific group (not global admin)
        var group = await groupRepository.GetByIdAsync(request.GroupId);
        if (group == null)
            throw new KeyNotFoundException($"Group {request.GroupId} not found");

        var currentMember = group.Members.FirstOrDefault(m => m.UserId == currentUserId);
        if (currentMember == null)
            throw new UnauthorizedAccessException("You must be a member of this group to create tasks");

        if (currentMember.Role != GroupRole.Admin)
            throw new UnauthorizedAccessException("Only group admins can create tasks");

        // Verify assigned user is a member of the group
        var assignedMember = group.Members.FirstOrDefault(m => m.UserId == request.AssignedUserId);
        if (assignedMember == null)
            throw new ArgumentException("Assigned user must be a member of this group");

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

        var taskId = await taskRepository.CreateAsync(task, ct);
        
        // Increment group task count
        group.TaskCount++;
        group.LastActivity = DateTime.UtcNow;
        await groupRepository.UpdateAsync(group);
        
        return taskId;
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
            IsOverdue = t.Status != Core.Domain.TaskStatus.Completed && t.DueAt < nowUtc
        }).ToList();

        return new PagedResult<TaskResponse>
        {
            Page = query.Page,
            PageSize = query.PageSize,
            Total = total,
            Items = mapped
        };
    }

        public async Task AssignTaskAsync(string taskId, string assigneeUserId, string requestingUserId, CancellationToken ct)
        {
            var task = await taskRepository.GetByIdAsync(taskId, ct);
            if (task == null)
            {
                throw new KeyNotFoundException($"Task {taskId} not found");
            }

            // Verify requesting user is admin of the group
            var group = await groupRepository.GetByIdAsync(task.GroupId);
            if (group == null)
            {
                throw new KeyNotFoundException($"Group {task.GroupId} not found");
            }

            var requestingMember = group.Members.FirstOrDefault(m => m.UserId == requestingUserId);
            if (requestingMember?.Role != GroupRole.Admin)
            {
                throw new UnauthorizedAccessException("Only group admins can assign tasks");
            }

            // Verify assignee is a member of the group
            var assigneeMember = group.Members.FirstOrDefault(m => m.UserId == assigneeUserId);
            if (assigneeMember == null)
            {
                throw new ArgumentException("Assignee must be a member of the group");
            }

            // Update task assignment
            task.AssignedUserId = assigneeUserId;
            await taskRepository.UpdateAsync(task, ct);
        }

        public async Task UnassignTaskAsync(string taskId, string requestingUserId, CancellationToken ct)
        {
            var task = await taskRepository.GetByIdAsync(taskId, ct);
            if (task == null)
            {
                throw new KeyNotFoundException($"Task {taskId} not found");
            }

            // Verify requesting user is admin of the group
            var group = await groupRepository.GetByIdAsync(task.GroupId);
            if (group == null)
            {
                throw new KeyNotFoundException($"Group {task.GroupId} not found");
            }

            var requestingMember = group.Members.FirstOrDefault(m => m.UserId == requestingUserId);
            if (requestingMember?.Role != GroupRole.Admin)
            {
                throw new UnauthorizedAccessException("Only group admins can unassign tasks");
            }

            // For unassign, we need to set it to some default user or throw error
            // Based on the design, tasks should always have an assignee
            // So unassign should probably just reassign to the requesting admin
            task.AssignedUserId = requestingUserId;
            await taskRepository.UpdateAsync(task, ct);
        }
}