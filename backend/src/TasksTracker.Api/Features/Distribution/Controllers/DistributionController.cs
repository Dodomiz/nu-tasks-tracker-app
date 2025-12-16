using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Features.Distribution.Models;
using TasksTracker.Api.Features.Distribution.Services;

namespace TasksTracker.Api.Features.Distribution.Controllers;

[ApiController]
[Route("api/distribution")]
[Authorize]
public class DistributionController(IDistributionService distributionService, ILogger<DistributionController> logger) : ControllerBase
{
    /// <summary>
    /// Generate a task distribution preview
    /// </summary>
    [HttpPost("generate")]
    public async Task<ActionResult<ApiResponse<GenerateDistributionResponse>>> Generate(
        [FromBody] GenerateDistributionRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            // Validate date range
            if (request.EndDate <= request.StartDate)
            {
                return BadRequest(ApiResponse<GenerateDistributionResponse>.ErrorResponse(
                    "INVALID_DATE_RANGE", "End date must be after start date"));
            }

            if ((request.EndDate - request.StartDate).TotalDays > 30)
            {
                return BadRequest(ApiResponse<GenerateDistributionResponse>.ErrorResponse(
                    "DATE_RANGE_TOO_LARGE", "Date range cannot exceed 30 days"));
            }

            var previewId = await distributionService.GenerateDistributionAsync(request, cancellationToken);

            return Ok(ApiResponse<GenerateDistributionResponse>.SuccessResponse(
                new GenerateDistributionResponse
                {
                    PreviewId = previewId,
                    Status = "Processing"
                }));
        }
        catch (InvalidOperationException ex)
        {
            logger.LogWarning(ex, "Invalid distribution request");
            return BadRequest(ApiResponse<GenerateDistributionResponse>.ErrorResponse("INVALID_REQUEST", ex.Message));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error generating distribution");
            return StatusCode(500, ApiResponse<GenerateDistributionResponse>.ErrorResponse(
                "GENERATION_ERROR", "An error occurred while generating distribution"));
        }
    }

    /// <summary>
    /// Get distribution preview by ID
    /// </summary>
    [HttpGet("preview/{id}")]
    public async Task<ActionResult<ApiResponse<DistributionPreview>>> GetPreview(string id)
    {
        try
        {
            var preview = await distributionService.GetPreviewAsync(id);
            if (preview == null)
            {
                return NotFound(ApiResponse<DistributionPreview>.ErrorResponse(
                    "PREVIEW_NOT_FOUND", $"Preview {id} not found"));
            }

            return Ok(ApiResponse<DistributionPreview>.SuccessResponse(preview));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching preview {PreviewId}", id);
            return StatusCode(500, ApiResponse<DistributionPreview>.ErrorResponse(
                "FETCH_ERROR", "An error occurred while fetching preview"));
        }
    }

    /// <summary>
    /// Apply a distribution (with optional modifications)
    /// </summary>
    [HttpPost("{id}/apply")]
    public async Task<ActionResult<ApiResponse<ApplyDistributionResponse>>> Apply(
        string id,
        [FromBody] ApplyDistributionRequest request)
    {
        try
        {
            var result = await distributionService.ApplyDistributionAsync(id, request);
            return Ok(ApiResponse<ApplyDistributionResponse>.SuccessResponse(result));
        }
        catch (InvalidOperationException ex)
        {
            logger.LogWarning(ex, "Invalid apply request for preview {PreviewId}", id);
            return BadRequest(ApiResponse<ApplyDistributionResponse>.ErrorResponse("INVALID_APPLY", ex.Message));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error applying distribution {PreviewId}", id);
            return StatusCode(500, ApiResponse<ApplyDistributionResponse>.ErrorResponse(
                "APPLY_ERROR", "An error occurred while applying distribution"));
        }
    }
}
