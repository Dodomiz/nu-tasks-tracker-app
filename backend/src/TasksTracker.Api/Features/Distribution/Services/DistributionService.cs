using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Core.Interfaces;
using TasksTracker.Api.Features.Distribution.Models;
using TasksTracker.Api.Features.Tasks.Services;

namespace TasksTracker.Api.Features.Distribution.Services;

/// <summary>
/// Service for managing task distributions
/// </summary>
public class DistributionService(
    IDistributionRepository distributionRepository,
    ITaskRepository taskRepository,
    IUserRepository userRepository,
    IGroupRepository groupRepository,
    AIDistributionEngine aiEngine,
    RuleBasedDistributor ruleBasedDistributor,
    ITaskService taskService,
    ILogger<DistributionService> logger) : IDistributionService
{
    public async Task<string> GenerateDistributionAsync(
        GenerateDistributionRequest request,
        CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Generating distribution for group {GroupId}, date range {StartDate} to {EndDate}",
            request.GroupId, request.StartDate, request.EndDate);

        // Validate group exists
        var group = await groupRepository.GetByIdAsync(request.GroupId);
        if (group == null)
        {
            throw new InvalidOperationException($"Group {request.GroupId} not found");
        }

        // Create preview entity
        var preview = new DistributionPreviewEntity
        {
            GroupId = request.GroupId,
            Status = "Processing",
            Method = "AI",
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        };

        var previewId = await distributionRepository.CreateAsync(preview);

        // Start background processing
        _ = Task.Run(async () =>
        {
            try
            {
                await ProcessDistributionAsync(previewId, request, cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error processing distribution {PreviewId}", previewId);
                await UpdatePreviewStatusAsync(previewId, "Failed", error: ex.Message);
            }
        }, cancellationToken);

        return previewId;
    }

    private async Task ProcessDistributionAsync(
        string previewId,
        GenerateDistributionRequest request,
        CancellationToken cancellationToken)
    {
        // Get unassigned tasks in date range
        var tasks = await taskRepository.FindAsync(
            groupId: request.GroupId,
            status: null,
            assignedTo: null,
            categoryId: null,
            page: 1,
            pageSize: 100,
            cancellationToken); // Max 100 tasks per distribution

        var unassignedTasks = tasks.items
            .Where(t => t.DueAt >= request.StartDate && t.DueAt <= request.EndDate)
            .ToList();

        if (unassignedTasks.Count() == 0)
        {
            await UpdatePreviewStatusAsync(previewId, "Completed", error: "No unassigned tasks found in date range");
            return;
        }

        // Get users
        var group = await groupRepository.GetByIdAsync(request.GroupId);
        var userIds = request.UserIds?.Any() == true
            ? request.UserIds
            : group!.Members.Select(m => m.UserId).ToList();

        var users = new List<User>();
        foreach (var userId in userIds)
        {
            var user = await userRepository.GetByIdAsync(userId);
            if (user != null)
            {
                users.Add(user);
            }
        }

        if (users.Count == 0)
        {
            await UpdatePreviewStatusAsync(previewId, "Failed", error: "No valid users found");
            return;
        }

        // Try AI distribution first, fallback to rule-based
        List<AssignmentProposal> assignments;
        string method;

        try
        {
            assignments = await aiEngine.GenerateAsync(unassignedTasks, users, cancellationToken);
            method = "AI";
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "AI distribution failed, falling back to rule-based");
            assignments = ruleBasedDistributor.Distribute(unassignedTasks, users);
            method = "Rule-Based";
        }

        // Calculate stats
        var stats = CalculateStats(assignments, users);

        // Update preview
        var preview = await distributionRepository.GetByIdAsync(previewId);
        if (preview != null)
        {
            preview.Status = "Completed";
            preview.Method = method;
            preview.Assignments = assignments.Select(a => new AssignmentRecord
            {
                TaskId = a.TaskId,
                TaskName = a.TaskName,
                AssignedUserId = a.AssignedUserId,
                AssignedUserName = a.AssignedUserName,
                Confidence = a.Confidence,
                Rationale = a.Rationale
            }).ToList();
            preview.TotalTasks = stats.TotalTasks;
            preview.TotalUsers = stats.TotalUsers;
            preview.WorkloadVariance = stats.WorkloadVariance;
            preview.TasksPerUser = stats.TasksPerUser;

            await distributionRepository.UpdateAsync(preview);
        }

        logger.LogInformation("Distribution {PreviewId} completed using {Method}. Variance: {Variance}%",
            previewId, method, stats.WorkloadVariance);
    }

    public async Task<DistributionPreview?> GetPreviewAsync(string previewId)
    {
        var entity = await distributionRepository.GetByIdAsync(previewId);
        if (entity == null) return null;

        return new DistributionPreview
        {
            Id = entity.Id,
            Status = entity.Status,
            Method = entity.Method,
            Assignments = entity.Assignments.Select(a => new AssignmentProposal
            {
                TaskId = a.TaskId,
                TaskName = a.TaskName,
                AssignedUserId = a.AssignedUserId,
                AssignedUserName = a.AssignedUserName,
                Confidence = a.Confidence,
                Rationale = a.Rationale
            }).ToList(),
            Stats = new DistributionStats
            {
                TotalTasks = entity.TotalTasks,
                TotalUsers = entity.TotalUsers,
                WorkloadVariance = entity.WorkloadVariance,
                TasksPerUser = entity.TasksPerUser
            },
            Error = entity.Error,
            CreatedAt = entity.CreatedAt
        };
    }

    public async Task<ApplyDistributionResponse> ApplyDistributionAsync(
        string previewId,
        ApplyDistributionRequest request)
    {
        var preview = await distributionRepository.GetByIdAsync(previewId);
        if (preview == null)
        {
            throw new InvalidOperationException($"Preview {previewId} not found");
        }

        if (preview.Status != "Completed")
        {
            throw new InvalidOperationException($"Cannot apply preview with status {preview.Status}");
        }

        // Apply modifications if any
        var assignments = preview.Assignments.ToList();
        var modifiedCount = 0;

        if (request.Modifications?.Any() == true)
        {
            foreach (var mod in request.Modifications)
            {
                var assignment = assignments.FirstOrDefault(a => a.TaskId == mod.TaskId);
                if (assignment != null)
                {
                    assignment.AssignedUserId = mod.NewAssignedUserId;
                    var user = await userRepository.GetByIdAsync(mod.NewAssignedUserId);
                    if (user != null)
                    {
                        assignment.AssignedUserName = $"{user.FirstName} {user.LastName}";
                        modifiedCount++;
                    }
                }
            }
        }

        // Assign tasks (batch operation)
        foreach (var assignment in assignments)
        {
            var task = await taskRepository.GetByIdAsync(assignment.TaskId);
            if (task != null)
            {
                task.AssignedUserId = assignment.AssignedUserId;
                task.Status = Core.Domain.TaskStatus.InProgress;
                await taskRepository.UpdateAsync(task);
            }
        }

        // Recalculate final stats
        var users = assignments.Select(a => a.AssignedUserId).Distinct().ToList();
        var finalStats = CalculateStats(
            assignments.Select(a => new AssignmentProposal
            {
                TaskId = a.TaskId,
                TaskName = a.TaskName,
                AssignedUserId = a.AssignedUserId,
                AssignedUserName = a.AssignedUserName,
                Confidence = a.Confidence,
                Rationale = a.Rationale
            }).ToList(),
            await GetUsersByIdsAsync(users));

        logger.LogInformation("Applied distribution {PreviewId}. Assigned: {Count}, Modified: {ModifiedCount}",
            previewId, assignments.Count, modifiedCount);

        return new ApplyDistributionResponse
        {
            AssignedCount = assignments.Count,
            ModifiedCount = modifiedCount,
            FinalStats = finalStats
        };
    }

    private async Task UpdatePreviewStatusAsync(string previewId, string status, string? error = null)
    {
        var preview = await distributionRepository.GetByIdAsync(previewId);
        if (preview != null)
        {
            preview.Status = status;
            preview.Error = error;
            await distributionRepository.UpdateAsync(preview);
        }
    }

    private DistributionStats CalculateStats(List<AssignmentProposal> assignments, List<User> users)
    {
        var tasksPerUser = assignments
            .GroupBy(a => a.AssignedUserId)
            .ToDictionary(g => g.Key, g => g.Count());

        // Fill in zeros for users with no tasks
        foreach (var user in users)
        {
            if (!tasksPerUser.ContainsKey(user.Id))
            {
                tasksPerUser[user.Id] = 0;
            }
        }

        var counts = tasksPerUser.Values.ToList();
        var avg = counts.Any() ? counts.Average() : 0;
        var max = counts.Any() ? counts.Max() : 0;
        var min = counts.Any() ? counts.Min() : 0;
        var variance = avg > 0 ? Math.Round((max - min) / avg * 100, 2) : 0;

        return new DistributionStats
        {
            TotalTasks = assignments.Count,
            TotalUsers = users.Count,
            WorkloadVariance = variance,
            TasksPerUser = tasksPerUser
        };
    }

    private async Task<List<User>> GetUsersByIdsAsync(List<string> userIds)
    {
        var users = new List<User>();
        foreach (var userId in userIds)
        {
            var user = await userRepository.GetByIdAsync(userId);
            if (user != null)
            {
                users.Add(user);
            }
        }
        return users;
    }
}
