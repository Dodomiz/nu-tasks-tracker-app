using TasksTracker.Api.Core.Domain;

namespace TasksTracker.Api.Features.Workload.Models;

public class UserWorkload
{
    public string UserId { get; set; } = null!;
    public string DisplayName { get; set; } = string.Empty;
    public int TaskCount { get; set; }
    public int TotalDifficulty { get; set; }
    public double Percentage { get; set; }
}

public class WorkloadMetrics
{
    public string GroupId { get; set; } = null!;
    public int MemberCount { get; set; }
    public int TotalTasks { get; set; }
    public int TotalDifficulty { get; set; }
    public double AverageDifficultyPerUser { get; set; }
    public int MinDifficulty { get; set; }
    public int MaxDifficulty { get; set; }
    public double VariancePercent { get; set; }
    public string ThresholdColor { get; set; } = "green"; // green/yellow/red
    public List<UserWorkload> Users { get; set; } = new();
}

public enum DifficultyRange
{
    All,
    Easy,
    Medium,
    Hard
}
