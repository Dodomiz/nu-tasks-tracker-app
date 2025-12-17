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

        /// <summary>
        /// Assign task to a group member (Admin only)
        /// </summary>
        [HttpPatch("{taskId}/assign")]
        [Authorize]
        public async Task<IActionResult> AssignTask(string taskId, [FromBody] AssignTaskRequest request, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(request.AssigneeUserId))
            {
                return BadRequest("AssigneeUserId is required.");
            }

            var userId = User.FindFirst("sub")?.Value ?? string.Empty;

            try
            {
                await taskService.AssignTaskAsync(taskId, request.AssigneeUserId, userId, ct);
                return Ok(new { message = "Task assigned successfully" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { error = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Unassign task (reassigns to requesting admin)
        /// </summary>
        [HttpPatch("{taskId}/unassign")]
        [Authorize]
        public async Task<IActionResult> UnassignTask(string taskId, CancellationToken ct)
        {
            var userId = User.FindFirst("sub")?.Value ?? string.Empty;

            try
            {
                await taskService.UnassignTaskAsync(taskId, userId, ct);
                return Ok(new { message = "Task unassigned successfully" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { error = ex.Message });
            }
        }
}