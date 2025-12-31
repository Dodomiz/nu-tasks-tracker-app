using TasksTracker.Api.Core.Domain;

namespace TasksTracker.Api.Features.Tasks.Models;

public class CreateTaskRequest
{
    public string GroupId { get; set; } = null!;
    public string AssignedUserId { get; set; } = null!;
    public string? TemplateId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int Difficulty { get; set; }
    public DateTime DueAt { get; set; }
    public TaskFrequency Frequency { get; set; } = TaskFrequency.OneTime;
    public bool RequiresApproval { get; set; } = false;
}

    public class AssignTaskRequest
    {
        public string AssigneeUserId { get; set; } = null!;
    }