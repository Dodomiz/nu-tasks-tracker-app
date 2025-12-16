using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Features.Distribution.Models;

namespace TasksTracker.Api.Features.Distribution.Services;

/// <summary>
/// Rule-based task distributor (fallback when AI is unavailable)
/// </summary>
public class RuleBasedDistributor(ILogger<RuleBasedDistributor> logger)
{
    /// <summary>
    /// Distribute tasks using simple rule-based algorithm
    /// </summary>
    public List<AssignmentProposal> Distribute(
        List<TaskItem> tasks,
        List<User> users)
    {
        logger.LogInformation("Using rule-based distribution for {TaskCount} tasks and {UserCount} users",
            tasks.Count, users.Count);

        var assignments = new List<AssignmentProposal>();
        var userTaskCounts = users.ToDictionary(u => u.Id, _ => 0);

        // Sort tasks by difficulty (descending) - assign harder tasks first
        var sortedTasks = tasks.OrderByDescending(t => t.Difficulty).ToList();

        foreach (var task in sortedTasks)
        {
            // Find user with lowest current task count
            var selectedUser = users
                .OrderBy(u => userTaskCounts[u.Id])
                .ThenBy(u => u.Id) // Deterministic tiebreaker
                .First();

            assignments.Add(new AssignmentProposal
            {
                TaskId = task.Id,
                TaskName = task.Name,
                AssignedUserId = selectedUser.Id,
                AssignedUserName = $"{selectedUser.FirstName} {selectedUser.LastName}",
                Confidence = 0.5, // Fixed confidence for rule-based
                Rationale = $"Rule-based: Lowest workload ({userTaskCounts[selectedUser.Id]} tasks)"
            });

            userTaskCounts[selectedUser.Id]++;
        }

        logger.LogInformation("Rule-based distribution complete. Variance: {Variance}%",
            CalculateVariance(userTaskCounts));

        return assignments;
    }

    private double CalculateVariance(Dictionary<string, int> taskCounts)
    {
        if (taskCounts.Count == 0) return 0;

        var values = taskCounts.Values.ToList();
        var avg = values.Average();
        var max = values.Max();
        var min = values.Min();

        if (avg == 0) return 0;

        return Math.Round((max - min) / avg * 100, 2);
    }
}
