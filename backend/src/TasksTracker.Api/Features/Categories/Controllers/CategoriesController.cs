using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Features.Categories.Models;
using TasksTracker.Api.Features.Categories.Services;

namespace TasksTracker.Api.Features.Categories.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriesController(
    ICategoryService categoryService,
    ILogger<CategoriesController> logger) : ControllerBase
{
    private string UserId => User.FindFirst(ClaimTypes.NameIdentifier)?.Value
        ?? throw new UnauthorizedAccessException("User ID not found in token");

    /// <summary>
    /// Get system + custom categories for a group
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<CategoryResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCategories([FromQuery] string groupId)
    {
        try
        {
            var categories = await categoryService.GetCategoriesAsync(groupId, UserId);
            return Ok(ApiResponse<List<CategoryResponse>>.SuccessResponse(categories));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiResponse<object>.ErrorResponse("GROUP_NOT_FOUND", "Group not found"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<object>.ErrorResponse("NOT_MEMBER", ex.Message));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching categories for group {GroupId}", groupId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("SERVER_ERROR", "An error occurred"));
        }
    }

    /// <summary>
    /// Get single category by id
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<CategoryResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCategory(string id)
    {
        try
        {
            var category = await categoryService.GetCategoryAsync(id, UserId);
            return Ok(ApiResponse<CategoryResponse>.SuccessResponse(category));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiResponse<object>.ErrorResponse("CATEGORY_NOT_FOUND", "Category not found"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<object>.ErrorResponse("NOT_MEMBER", ex.Message));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching category {CategoryId}", id);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("SERVER_ERROR", "An error occurred"));
        }
    }

    /// <summary>
    /// Create custom category (Admin only)
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<CategoryResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create([FromQuery] string groupId, [FromBody] CreateCategoryRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("VALIDATION_ERROR", "Invalid input data"));
        }

        try
        {
            var created = await categoryService.CreateCategoryAsync(groupId, request, UserId);
            return CreatedAtAction(nameof(GetCategory), new { id = created.Id }, ApiResponse<CategoryResponse>.SuccessResponse(created));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("VALIDATION_ERROR", ex.Message));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<object>.ErrorResponse("NOT_ADMIN", ex.Message));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiResponse<object>.ErrorResponse("GROUP_NOT_FOUND", "Group not found"));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating category in group {GroupId}", groupId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("SERVER_ERROR", "An error occurred"));
        }
    }

    /// <summary>
    /// Update custom category (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<CategoryResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateCategoryRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("VALIDATION_ERROR", "Invalid input data"));
        }

        try
        {
            var updated = await categoryService.UpdateCategoryAsync(id, request, UserId);
            return Ok(ApiResponse<CategoryResponse>.SuccessResponse(updated));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("VALIDATION_ERROR", ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("INVALID_OPERATION", ex.Message));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<object>.ErrorResponse("NOT_ADMIN", ex.Message));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiResponse<object>.ErrorResponse("CATEGORY_NOT_FOUND", "Category not found"));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating category {CategoryId}", id);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("SERVER_ERROR", "An error occurred"));
        }
    }

    /// <summary>
    /// Delete custom category (Admin only)
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(string id)
    {
        try
        {
            await categoryService.DeleteCategoryAsync(id, UserId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(409, ApiResponse<object>.ErrorResponse("CATEGORY_IN_USE", ex.Message));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<object>.ErrorResponse("NOT_ADMIN", ex.Message));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiResponse<object>.ErrorResponse("CATEGORY_NOT_FOUND", "Category not found"));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting category {CategoryId}", id);
            return StatusCode(500, ApiResponse<object>.ErrorResponse("SERVER_ERROR", "An error occurred"));
        }
    }
}
