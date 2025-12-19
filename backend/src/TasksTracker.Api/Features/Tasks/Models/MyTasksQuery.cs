namespace TasksTracker.Api.Features.Tasks.Models;

/// <summary>
/// Query parameters for GET /tasks/my-tasks endpoint
/// </summary>
public class MyTasksQuery
{
    /// <summary>
    /// Filter by difficulty (1-10)
    /// </summary>
    public int? Difficulty { get; set; }
    
    /// <summary>
    /// Filter by task status
    /// </summary>
    public Core.Domain.TaskStatus? Status { get; set; }
    
    /// <summary>
    /// Sort field: "difficulty", "status", "dueDate"
    /// </summary>
    public string SortBy { get; set; } = "dueDate";
    
    /// <summary>
    /// Sort order: "asc" or "desc"
    /// </summary>
    public string SortOrder { get; set; } = "asc";
    
    /// <summary>
    /// Page number (1-based)
    /// </summary>
    public int Page { get; set; } = 1;
    
    /// <summary>
    /// Page size (max 100)
    /// </summary>
    public int PageSize { get; set; } = 50;
}
