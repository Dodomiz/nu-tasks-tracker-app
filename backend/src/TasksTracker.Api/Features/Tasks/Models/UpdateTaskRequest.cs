using TasksTracker.Api.Core.Domain;

namespace TasksTracker.Api.Features.Tasks.Models;

public class UpdateTaskRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public int? Difficulty { get; set; }
    public DateTime? DueAt { get; set; }
    public TaskFrequency? Frequency { get; set; }
}
