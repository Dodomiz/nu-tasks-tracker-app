using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Core.Interfaces;
using TasksTracker.Api.Features.Tasks.Models;
using TasksTracker.Api.Features.Notifications.Services;
using TasksTracker.Api.Features.Notifications.Models;

namespace TasksTracker.Api.Features.Tasks.Services;

public class TaskService(
    ITaskRepository taskRepository,
    IGroupRepository groupRepository,
    IUserRepository userRepository,
    ITaskHistoryRepository taskHistoryRepository,
    NotificationService notificationService,
    ILogger<TaskService> logger) : ITaskService
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

        // Validate approval requirement: only admins can create approval-required tasks
        if (request.RequiresApproval && currentMember.Role != GroupRole.Admin)
            throw new UnauthorizedAccessException("Only group admins can create tasks that require approval");

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
            RequiresApproval = request.RequiresApproval,
            CreatedByUserId = currentUserId
        };

        var taskId = await taskRepository.CreateAsync(task, ct);
        
        // Log task creation history
        var historyEntry = await taskHistoryRepository.CreateAsync(new TaskHistory
        {
            TaskId = taskId,
            GroupId = request.GroupId,
            ChangedByUserId = currentUserId,
            Action = TaskHistoryAction.Created,
            Changes = new Dictionary<string, string>
            {
                ["Name"] = task.Name,
                ["AssignedTo"] = task.AssignedUserId,
                ["Difficulty"] = task.Difficulty.ToString(),
                ["DueAt"] = task.DueAt.ToString("O"),
                ["Status"] = task.Status.ToString()
            }
        });
        
        // Create notification for assigned user (if not self-assigned)
        if (request.AssignedUserId != currentUserId)
        {
            try
            {
                var assignerUser = await userRepository.GetByIdAsync(currentUserId);
                await notificationService.CreateNotificationAsync(new CreateNotificationRequest(
                    UserId: request.AssignedUserId,
                    Type: NotificationType.TASK_ASSIGNED,
                    Content: new NotificationContentDto(
                        Title: "New Task Assigned",
                        Body: $"{assignerUser?.FirstName} {assignerUser?.LastName} assigned you a task: {task.Name}",
                        Metadata: new Dictionary<string, object>
                        {
                            ["taskId"] = taskId,
                            ["taskName"] = task.Name,
                            ["groupId"] = request.GroupId
                        }
                    )
                ), ct);
            }
            catch (Exception ex)
            {
                // Don't let notification failure block task creation
                logger.LogError(ex, "Failed to create TASK_ASSIGNED notification for task {TaskId}", taskId);
            }
        }
        
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
            IsOverdue = t.Status != Core.Domain.TaskStatus.Completed && t.DueAt < nowUtc,
            RequiresApproval = t.RequiresApproval
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
            var oldAssigneeId = task.AssignedUserId;
            task.AssignedUserId = assigneeUserId;
            await taskRepository.UpdateAsync(task, ct);
            
            // Log reassignment history
            var historyEntry = await taskHistoryRepository.CreateAsync(new TaskHistory
            {
                TaskId = taskId,
                GroupId = task.GroupId,
                ChangedByUserId = requestingUserId,
                Action = TaskHistoryAction.Reassigned,
                Changes = new Dictionary<string, string>
                {
                    ["OldAssignee"] = oldAssigneeId,
                    ["NewAssignee"] = assigneeUserId
                }
            });
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

        public async Task UpdateTaskStatusAsync(string taskId, Core.Domain.TaskStatus newStatus, string requestingUserId, CancellationToken ct)
        {
            var task = await taskRepository.GetByIdAsync(taskId, ct);
            if (task == null)
            {
                throw new KeyNotFoundException($"Task {taskId} not found");
            }

            // Verify requesting user is either:
            // 1. The assigned user (can update their own task status)
            // 2. An admin of the group
            var group = await groupRepository.GetByIdAsync(task.GroupId);
            if (group == null)
            {
                throw new KeyNotFoundException($"Group {task.GroupId} not found");
            }

            var requestingMember = group.Members.FirstOrDefault(m => m.UserId == requestingUserId);
            if (requestingMember == null)
            {
                throw new UnauthorizedAccessException("You must be a member of this group");
            }

            // Allow if user is the assignee OR an admin
            var isAssignee = task.AssignedUserId == requestingUserId;
            var isAdmin = requestingMember.Role == GroupRole.Admin;
            
            if (!isAssignee && !isAdmin)
            {
                throw new UnauthorizedAccessException("Only the assigned user or group admins can update task status");
            }

            // Approval validation: only admins can mark approval-required tasks as Completed
            if (task.RequiresApproval && newStatus == Core.Domain.TaskStatus.Completed && !isAdmin)
            {
                throw new UnauthorizedAccessException("Only group admins can mark approval-required tasks as completed");
            }

            // Update task status
            var oldStatus = task.Status;
            task.Status = newStatus;
            await taskRepository.UpdateAsync(task, ct);
            
            // Log status change history
            var historyEntry = await taskHistoryRepository.CreateAsync(new TaskHistory
            {
                TaskId = taskId,
                GroupId = task.GroupId,
                ChangedByUserId = requestingUserId,
                Action = TaskHistoryAction.StatusChanged,
                Changes = new Dictionary<string, string>
                {
                    ["OldStatus"] = oldStatus.ToString(),
                    ["NewStatus"] = newStatus.ToString()
                }
            });
            
            // Create notifications
            try
            {
                var changerUser = await userRepository.GetByIdAsync(requestingUserId);
                
                // Notify task creator of status change (if not self-changed)
                if (task.CreatedByUserId != requestingUserId && !string.IsNullOrEmpty(task.CreatedByUserId))
                {
                    await notificationService.CreateNotificationAsync(new CreateNotificationRequest(
                        UserId: task.CreatedByUserId,
                        Type: NotificationType.TASK_STATUS_CHANGED,
                        Content: new NotificationContentDto(
                            Title: "Task Status Changed",
                            Body: $"{changerUser?.FirstName} {changerUser?.LastName} changed task '{task.Name}' status from {oldStatus} to {newStatus}",
                            Metadata: new Dictionary<string, object>
                            {
                                ["taskId"] = taskId,
                                ["taskName"] = task.Name,
                                ["oldStatus"] = oldStatus.ToString(),
                                ["newStatus"] = newStatus.ToString()
                            }
                        )
                    ), ct);
                }
                
                // If task requires approval and status changed to Completed by non-admin (which should be blocked above),
                // OR if task has RequiresApproval and is transitioning to WaitingForApproval
                if (task.RequiresApproval && newStatus == Core.Domain.TaskStatus.WaitingForApproval)
                {
                    // Notify all group admins
                    var groupAdmins = group.Members
                        .Where(m => m.Role == GroupRole.Admin && m.UserId != requestingUserId)
                        .Select(m => m.UserId)
                        .ToList();
                    
                    foreach (var adminId in groupAdmins)
                    {
                        await notificationService.CreateNotificationAsync(new CreateNotificationRequest(
                            UserId: adminId,
                            Type: NotificationType.TASK_PENDING_APPROVAL,
                            Content: new NotificationContentDto(
                                Title: "Task Pending Approval",
                                Body: $"{changerUser?.FirstName} {changerUser?.LastName} submitted task '{task.Name}' for approval",
                                Metadata: new Dictionary<string, object>
                                {
                                    ["taskId"] = taskId,
                                    ["taskName"] = task.Name,
                                    ["submitterId"] = requestingUserId
                                }
                            )
                        ), ct);
                    }
                }
            }
            catch (Exception ex)
            {
                // Don't let notification failure block status update
                logger.LogError(ex, "Failed to create notifications for task status change {TaskId}", taskId);
            }
        }

        public async Task UpdateTaskAsync(string taskId, UpdateTaskRequest request, string requestingUserId, CancellationToken ct)
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
                throw new UnauthorizedAccessException("Only group admins can edit tasks");
            }

            // Validate inputs if provided
            if (request.Difficulty.HasValue && (request.Difficulty < 1 || request.Difficulty > 10))
            {
                throw new ArgumentException("Difficulty must be between 1 and 10.");
            }

            if (!string.IsNullOrWhiteSpace(request.Name) && request.Name.Length > 200)
            {
                throw new ArgumentException("Name must not exceed 200 characters.");
            }

            // Track changes for history
            var changes = new Dictionary<string, string>();

            if (!string.IsNullOrWhiteSpace(request.Name) && request.Name != task.Name)
            {
                changes["OldName"] = task.Name;
                changes["NewName"] = request.Name;
                task.Name = request.Name;
            }

            if (request.Description != null && request.Description != task.Description)
            {
                changes["OldDescription"] = task.Description ?? "(empty)";
                changes["NewDescription"] = request.Description;
                task.Description = request.Description;
            }

            if (request.Difficulty.HasValue && request.Difficulty != task.Difficulty)
            {
                changes["OldDifficulty"] = task.Difficulty.ToString();
                changes["NewDifficulty"] = request.Difficulty.Value.ToString();
                task.Difficulty = request.Difficulty.Value;
            }

            if (request.DueAt.HasValue && request.DueAt != task.DueAt)
            {
                changes["OldDueAt"] = task.DueAt.ToString("O");
                changes["NewDueAt"] = request.DueAt.Value.ToString("O");
                task.DueAt = request.DueAt.Value;
            }

            if (request.Frequency.HasValue && request.Frequency != task.Frequency)
            {
                changes["OldFrequency"] = task.Frequency.ToString();
                changes["NewFrequency"] = request.Frequency.Value.ToString();
                task.Frequency = request.Frequency.Value;
            }

            if (request.RequiresApproval.HasValue && request.RequiresApproval != task.RequiresApproval)
            {
                changes["OldRequiresApproval"] = task.RequiresApproval.ToString();
                changes["NewRequiresApproval"] = request.RequiresApproval.Value.ToString();
                task.RequiresApproval = request.RequiresApproval.Value;
            }

            // Only update if there are actual changes
            if (changes.Count > 0)
            {
                await taskRepository.UpdateAsync(task, ct);

                // Log update history
                var historyEntry = await taskHistoryRepository.CreateAsync(new TaskHistory
                {
                    TaskId = taskId,
                    GroupId = task.GroupId,
                    ChangedByUserId = requestingUserId,
                    Action = TaskHistoryAction.Updated,
                    Changes = changes
                });
            }
        }

        public async Task<PagedResult<TaskWithGroupDto>> GetUserTasksAsync(string userId, MyTasksQuery query, CancellationToken ct)
        {
            // Fetch tasks from repository with filters and sorting
            var (items, total) = await taskRepository.FindUserTasksAsync(
                userId,
                query.Difficulty,
                query.Status,
                query.SortBy,
                query.SortOrder,
                query.Page,
                query.PageSize,
                ct);

            // Get distinct group IDs from tasks
            var groupIds = items.Select(t => t.GroupId).Distinct().ToList();

            // Batch fetch groups to enrich tasks with group names
            var groupTasks = groupIds.Select(async groupId => 
                await groupRepository.GetByIdAsync(groupId));
            var groups = await Task.WhenAll(groupTasks);
            var groupDictionary = groups
                .Where(g => g != null)
                .ToDictionary(g => g!.Id, g => g!.Name);

            var nowUtc = DateTime.UtcNow;

            // Map to TaskWithGroupDto
            var mapped = items.Select(t => new TaskWithGroupDto
            {
                Id = t.Id,
                GroupId = t.GroupId,
                GroupName = groupDictionary.TryGetValue(t.GroupId, out var groupName) 
                    ? groupName 
                    : "Unknown Group",
                AssignedUserId = t.AssignedUserId,
                TemplateId = t.TemplateId,
                Name = t.Name,
                Description = t.Description,
                Difficulty = t.Difficulty,
                Status = t.Status,
                DueAt = t.DueAt,
                IsOverdue = t.Status != Core.Domain.TaskStatus.Completed && t.DueAt < nowUtc,
                RequiresApproval = t.RequiresApproval
            }).ToList();

            return new PagedResult<TaskWithGroupDto>
            {
                Page = query.Page,
                PageSize = query.PageSize,
                Total = total,
                Items = mapped
            };
        }

        public async Task<List<TaskHistoryResponse>> GetTaskHistoryAsync(string taskId, string requestingUserId, CancellationToken ct)
        {
            // Verify task exists
            var task = await taskRepository.GetByIdAsync(taskId, ct);
            if (task == null)
            {
                throw new KeyNotFoundException($"Task {taskId} not found");
            }

            // Verify user is a member of the group or admin
            var group = await groupRepository.GetByIdAsync(task.GroupId);
            if (group == null)
            {
                throw new KeyNotFoundException($"Group {task.GroupId} not found");
            }

            var requestingMember = group.Members.FirstOrDefault(m => m.UserId == requestingUserId);
            if (requestingMember == null)
            {
                throw new UnauthorizedAccessException("You must be a member of this group to view task history");
            }

            // Only admins can view full history
            if (requestingMember.Role != GroupRole.Admin)
            {
                throw new UnauthorizedAccessException("Only group admins can view task history");
            }

            // Get history entries
            var historyEntries = await taskHistoryRepository.GetByTaskIdAsync(taskId, ct);
            
            // Get unique user IDs from history
            var userIds = historyEntries.Select(h => h.ChangedByUserId).Distinct().ToList();
            var users = await userRepository.GetByIdsAsync(userIds, ct);
            var userDictionary = users.ToDictionary(u => u.Id, u => $"{u.FirstName} {u.LastName}");

            // Map to response
            return historyEntries.Select(h => new TaskHistoryResponse
            {
                Id = h.Id,
                TaskId = h.TaskId,
                GroupId = h.GroupId,
                ChangedByUserId = h.ChangedByUserId,
                ChangedByUserName = userDictionary.TryGetValue(h.ChangedByUserId, out var name) 
                    ? name 
                    : "Unknown User",
                Action = h.Action,
                ChangedAt = h.ChangedAt,
                Changes = h.Changes,
                Notes = h.Notes
            }).ToList();
        }
}