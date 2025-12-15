using TasksTracker.Api.Core.Domain;

namespace TasksTracker.Api.Features.Tasks.Models;

public class TaskResponse
{
    public string Id { get; set; } = null!;
    public string GroupId { get; set; } = null!;
    public string AssignedUserId { get; set; } = null!;
    public string? TemplateId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int Difficulty { get; set; }
    public TaskStatus Status { get; set; }
    public DateTime DueAt { get; set; }
    public bool IsOverdue { get; set; }
}
