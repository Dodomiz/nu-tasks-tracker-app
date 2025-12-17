using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Features.Dashboard.Models;
using TasksTracker.Api.Features.Dashboard.Services;

namespace TasksTracker.Api.Features.Dashboard.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController(IDashboardService dashboardService, ILogger<DashboardController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<DashboardResponse>>> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 12, CancellationToken ct = default)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<DashboardResponse>.ErrorResponse("UNAUTHORIZED", "User not authenticated"));
            }

            if (page <= 0 || pageSize <= 0)
            {
                return BadRequest(ApiResponse<DashboardResponse>.ErrorResponse("INVALID_PAGINATION", "Page and pageSize must be positive"));
            }

            var data = await dashboardService.GetDashboardAsync(userId, page, pageSize, ct);
            return Ok(ApiResponse<DashboardResponse>.SuccessResponse(data));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching dashboard data");
            return StatusCode(500, ApiResponse<DashboardResponse>.ErrorResponse("DASHBOARD_ERROR", "An error occurred while fetching dashboard data"));
        }
    }
}
 
