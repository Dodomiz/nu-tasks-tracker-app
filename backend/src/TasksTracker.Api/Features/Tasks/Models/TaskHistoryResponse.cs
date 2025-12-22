using TasksTracker.Api.Core.Domain;

namespace TasksTracker.Api.Features.Tasks.Models;

public class TaskHistoryResponse
{
    public string Id { get; set; } = null!;
    public string TaskId { get; set; } = null!;
    public string GroupId { get; set; } = null!;
    public string ChangedByUserId { get; set; } = null!;
    public string ChangedByUserName { get; set; } = null!;
    public TaskHistoryAction Action { get; set; }
    public DateTime ChangedAt { get; set; }
    public Dictionary<string, string> Changes { get; set; } = new();
    public string? Notes { get; set; }
}
