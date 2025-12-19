using TasksTracker.Api.Core.Domain;
using TaskStatus = TasksTracker.Api.Core.Domain.TaskStatus;

namespace TasksTracker.Api.Features.Tasks.Models;

/// <summary>
/// Response DTO for task with enriched group information
/// </summary>
public record TaskWithGroupDto
{
    public string Id { get; init; } = null!;
    public string GroupId { get; init; } = null!;
    public string GroupName { get; init; } = "Unknown Group";
    public string AssignedUserId { get; init; } = null!;
    public string? TemplateId { get; init; }
    public string Name { get; init; } = null!;
    public string? Description { get; init; }
    public int Difficulty { get; init; }
    public TaskStatus Status { get; init; }
    public DateTime DueAt { get; init; }
    public bool IsOverdue { get; init; }
}
