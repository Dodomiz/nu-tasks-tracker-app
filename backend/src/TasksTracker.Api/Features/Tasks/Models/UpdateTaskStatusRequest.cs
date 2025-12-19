using System.ComponentModel.DataAnnotations;

namespace TasksTracker.Api.Features.Tasks.Models;

public class UpdateTaskStatusRequest
{
    [Required]
    public Core.Domain.TaskStatus Status { get; set; }
}
