using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Features.Workload.Models;
using TasksTracker.Api.Features.Workload.Services;

namespace TasksTracker.Api.Features.Workload.Controllers;

[ApiController]
[Route("api/workload")]
public class WorkloadController(IWorkloadService workloadService) : ControllerBase
{
    [HttpGet("group/{groupId}")]
    [Authorize]
    public async Task<IActionResult> GetGroup(string groupId, [FromQuery] DifficultyRange range = DifficultyRange.All, CancellationToken ct = default)
    {
        var result = await workloadService.GetGroupWorkloadAsync(groupId, range, ct);
        return Ok(ApiResponse<WorkloadMetrics>.SuccessResponse(result));
    }

    [HttpGet("preview")]
    [Authorize]
    public async Task<IActionResult> Preview([FromQuery] string groupId, [FromQuery] string assignedTo, [FromQuery] int difficulty, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(groupId) || string.IsNullOrWhiteSpace(assignedTo))
            return BadRequest("groupId and assignedTo are required.");
        if (difficulty < 1 || difficulty > 10)
            return BadRequest("difficulty must be 1-10.");

        var (current, preview) = await workloadService.GetPreviewAsync(groupId, assignedTo, difficulty, ct);
        return Ok(ApiResponse<object>.SuccessResponse(new { current, preview }));
    }
}
