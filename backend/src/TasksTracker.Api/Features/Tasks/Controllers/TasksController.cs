using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TasksTracker.Api.Features.Tasks.Models;
using TasksTracker.Api.Features.Tasks.Services;
using TasksTracker.Api.Core.Domain;

namespace TasksTracker.Api.Features.Tasks.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController(ITaskService taskService) : ControllerBase
{
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateTaskRequest request, CancellationToken ct)
    {
        // Basic validation per repository guidance (controller-level)
        if (string.IsNullOrWhiteSpace(request.GroupId)) return BadRequest("GroupId is required.");
        if (string.IsNullOrWhiteSpace(request.AssignedUserId)) return BadRequest("AssignedUserId is required.");
        if (string.IsNullOrWhiteSpace(request.Name)) return BadRequest("Name is required.");
        if (request.Difficulty is < 1 or > 10) return BadRequest("Difficulty must be between 1 and 10.");

        var userId = User.FindFirst("sub")?.Value ?? string.Empty;
        var roles = User.FindAll("role").Select(r => r.Value).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var isAdmin = roles.Contains(GroupRole.Admin);

        var id = await taskService.CreateAsync(request, userId, isAdmin, ct);
        return Created($"/api/tasks/{id}", new { id });
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> List([FromQuery] TaskListQuery query, CancellationToken ct)
    {
        // Minimal validation
        if (query.PageSize is < 1 or > 100) return BadRequest("PageSize must be between 1 and 100.");

        var result = await taskService.ListAsync(query, ct);
        return Ok(ApiResponse<PagedResult<TaskResponse>>.SuccessResponse(result));
    }
}