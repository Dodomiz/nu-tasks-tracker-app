using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Features.Templates.Models;
using TasksTracker.Api.Features.Templates.Services;

namespace TasksTracker.Api.Features.Templates.Controllers;

/// <summary>
/// Controller for managing task templates
/// </summary>
[ApiController]
[Route("api/groups/{groupId}/templates")]
[Authorize]
public class TemplatesController(
    ITemplateService templateService,
    ILogger<TemplatesController> logger) : ControllerBase
{
    private string UserId => User.FindFirst(ClaimTypes.NameIdentifier)?.Value
        ?? throw new UnauthorizedAccessException("User ID not found in token");

    /// <summary>
    /// Get all templates accessible to a group (system + group-specific) with optional filters
    /// </summary>
    /// <param name="groupId">Group ID</param>
    /// <param name="query">Optional filter parameters</param>
    /// <returns>List of templates</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<TemplateResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTemplates(
        [FromRoute] string groupId,
        [FromQuery] GetTemplatesQuery query)
    {
        try
        {
            var templates = await templateService.GetTemplatesAsync(groupId, UserId, query);
            return Ok(ApiResponse<List<TemplateResponse>>.SuccessResponse(templates));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.ErrorResponse("GROUP_NOT_FOUND", ex.Message));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<object>.ErrorResponse("NOT_MEMBER", ex.Message));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching templates for group {GroupId}", groupId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("SERVER_ERROR", "An error occurred while fetching templates"));
        }
    }

    /// <summary>
    /// Get single template by ID
    /// </summary>
    /// <param name="groupId">Group ID</param>
    /// <param name="id">Template ID</param>
    /// <returns>Template details</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<TemplateResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTemplate(
        [FromRoute] string groupId,
        [FromRoute] string id)
    {
        try
        {
            var template = await templateService.GetTemplateByIdAsync(groupId, id, UserId);
            return Ok(ApiResponse<TemplateResponse>.SuccessResponse(template));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.ErrorResponse("TEMPLATE_NOT_FOUND", ex.Message));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<object>.ErrorResponse("ACCESS_DENIED", ex.Message));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching template {TemplateId} for group {GroupId}", id, groupId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("SERVER_ERROR", "An error occurred while fetching the template"));
        }
    }

    /// <summary>
    /// Create new group-specific template (Admin only)
    /// </summary>
    /// <param name="groupId">Group ID</param>
    /// <param name="request">Template creation request</param>
    /// <returns>Created template</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<TemplateResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateTemplate(
        [FromRoute] string groupId,
        [FromBody] CreateTemplateRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("VALIDATION_ERROR", "Invalid input data"));
        }

        try
        {
            var template = await templateService.CreateTemplateAsync(groupId, request, UserId);
            return CreatedAtAction(
                nameof(GetTemplate),
                new { groupId, id = template.Id },
                ApiResponse<TemplateResponse>.SuccessResponse(template));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.ErrorResponse("GROUP_NOT_FOUND", ex.Message));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("VALIDATION_ERROR", ex.Message));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<object>.ErrorResponse("NOT_ADMIN", ex.Message));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating template in group {GroupId}", groupId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("SERVER_ERROR", "An error occurred while creating the template"));
        }
    }

    /// <summary>
    /// Update existing group-specific template (Admin only, system templates read-only)
    /// </summary>
    /// <param name="groupId">Group ID</param>
    /// <param name="id">Template ID</param>
    /// <param name="request">Template update request</param>
    /// <returns>Updated template</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<TemplateResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTemplate(
        [FromRoute] string groupId,
        [FromRoute] string id,
        [FromBody] UpdateTemplateRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("VALIDATION_ERROR", "Invalid input data"));
        }

        try
        {
            var template = await templateService.UpdateTemplateAsync(groupId, id, request, UserId);
            return Ok(ApiResponse<TemplateResponse>.SuccessResponse(template));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.ErrorResponse("TEMPLATE_NOT_FOUND", ex.Message));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("VALIDATION_ERROR", ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(403, ApiResponse<object>.ErrorResponse("SYSTEM_TEMPLATE_READONLY", ex.Message));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<object>.ErrorResponse("NOT_ADMIN", ex.Message));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating template {TemplateId} in group {GroupId}", id, groupId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("SERVER_ERROR", "An error occurred while updating the template"));
        }
    }

    /// <summary>
    /// Delete group-specific template (Admin only, soft delete)
    /// </summary>
    /// <param name="groupId">Group ID</param>
    /// <param name="id">Template ID</param>
    /// <returns>No content</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTemplate(
        [FromRoute] string groupId,
        [FromRoute] string id)
    {
        try
        {
            await templateService.DeleteTemplateAsync(groupId, id, UserId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.ErrorResponse("TEMPLATE_NOT_FOUND", ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(403, ApiResponse<object>.ErrorResponse("SYSTEM_TEMPLATE_READONLY", ex.Message));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<object>.ErrorResponse("NOT_ADMIN", ex.Message));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting template {TemplateId} from group {GroupId}", id, groupId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("SERVER_ERROR", "An error occurred while deleting the template"));
        }
    }
}
