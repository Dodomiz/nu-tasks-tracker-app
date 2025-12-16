using TasksTracker.Api.Core.Domain;

namespace TasksTracker.Api.Features.Tasks.Models;

public class TaskListQuery
{
    public string? GroupId { get; set; }
    public Core.Domain.TaskStatus? Status { get; set; }
    public string? AssignedTo { get; set; }
    public string? CategoryId { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
