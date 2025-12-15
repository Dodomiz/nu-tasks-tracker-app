using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Features.Groups.Models;
using TasksTracker.Api.Features.Groups.Services;

namespace TasksTracker.Api.Features.Groups.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GroupsController(
    IGroupService groupService,
    IInvitationService invitationService,
    ILogger<GroupsController> logger) : ControllerBase
{
    private string UserId => User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
        ?? throw new UnauthorizedAccessException("User ID not found in token");

    /// <summary>
    /// Create a new group
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<GroupResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateGroup([FromBody] CreateGroupRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "VALIDATION_ERROR",
                "Invalid input data"));
        }

        try
        {
            var response = await groupService.CreateGroupAsync(request, UserId);
            logger.LogInformation("Group {GroupId} created by user {UserId}", response.Id, UserId);

            return CreatedAtAction(
                nameof(GetGroup),
                new { id = response.Id },
                ApiResponse<GroupResponse>.SuccessResponse(response));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("VALIDATION_ERROR", ex.Message));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating group");
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "SERVER_ERROR",
                "An error occurred while creating the group"));
        }
    }

    /// <summary>
    /// Get user's groups with pagination
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<GroupsResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUserGroups([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        try
        {
            var response = await groupService.GetUserGroupsAsync(UserId, page, pageSize);
            return Ok(ApiResponse<GroupsResponse>.SuccessResponse(response));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching user groups");
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "SERVER_ERROR",
                "An error occurred while fetching groups"));
        }
    }

    /// <summary>
    /// Get specific group details
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<GroupResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetGroup(string id)
    {
        try
        {
            var response = await groupService.GetGroupAsync(id, UserId);
            return Ok(ApiResponse<GroupResponse>.SuccessResponse(response));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "GROUP_NOT_FOUND",
                $"Group {id} not found"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<object>.ErrorResponse(
                "NOT_MEMBER",
                ex.Message));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching group {GroupId}", id);
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "SERVER_ERROR",
                "An error occurred while fetching the group"));
        }
    }

    /// <summary>
    /// Update group settings (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<GroupResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateGroup(string id, [FromBody] UpdateGroupRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "VALIDATION_ERROR",
                "Invalid input data"));
        }

        try
        {
            var response = await groupService.UpdateGroupAsync(id, request, UserId);
            return Ok(ApiResponse<GroupResponse>.SuccessResponse(response));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "GROUP_NOT_FOUND",
                $"Group {id} not found"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<object>.ErrorResponse(
                "NOT_ADMIN",
                ex.Message));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("VALIDATION_ERROR", ex.Message));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating group {GroupId}", id);
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "SERVER_ERROR",
                "An error occurred while updating the group"));
        }
    }

    /// <summary>
    /// Delete group (Admin only)
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteGroup(string id)
    {
        try
        {
            await groupService.DeleteGroupAsync(id, UserId);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "GROUP_NOT_FOUND",
                $"Group {id} not found"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<object>.ErrorResponse(
                "NOT_ADMIN",
                ex.Message));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting group {GroupId}", id);
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "SERVER_ERROR",
                "An error occurred while deleting the group"));
        }
    }

    /// <summary>
    /// Invite member to group via email (Admin only)
    /// </summary>
    [HttpPost("{id}/invite")]
    [ProducesResponseType(typeof(ApiResponse<InviteResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> InviteMember(string id, [FromBody] InviteMemberRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "VALIDATION_ERROR",
                "Invalid email address"));
        }

        try
        {
            // Get group to validate membership and get invitation code
            var group = await groupService.GetGroupAsync(id, UserId);

            // Check if user is admin
            if (group.MyRole != "Admin")
            {
                return StatusCode(403, ApiResponse<object>.ErrorResponse(
                    "NOT_ADMIN",
                    "Only admins can invite members"));
            }

            // Check member limit
            if (group.MemberCount >= 20)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(
                    "MEMBER_LIMIT",
                    "Group has reached maximum of 20 members"));
            }

            var response = await invitationService.SendInvitationAsync(
                request.Email,
                group.Name,
                group.InvitationCode!,
                UserId);

            return Ok(ApiResponse<InviteResponse>.SuccessResponse(response));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "GROUP_NOT_FOUND",
                $"Group {id} not found"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<object>.ErrorResponse(
                "NOT_MEMBER",
                ex.Message));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error inviting member to group {GroupId}", id);
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "SERVER_ERROR",
                "An error occurred while sending the invitation"));
        }
    }

    /// <summary>
    /// Join group via invitation code
    /// </summary>
    [HttpPost("join/{invitationCode}")]
    [ProducesResponseType(typeof(ApiResponse<GroupResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> JoinGroup(string invitationCode)
    {
        try
        {
            // Validate invitation code and get group
            var valid = await invitationService.ValidateInvitationCodeAsync(invitationCode);
            if (!valid)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(
                    "INVALID_CODE",
                    "Invitation code is invalid or expired"));
            }

            // Get group by invitation code
            var group = await groupService.GetGroupAsync(invitationCode, UserId);

            // Check if user is already a member
            if (group != null && !string.IsNullOrEmpty(group.MyRole))
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(
                    "ALREADY_MEMBER",
                    "You are already a member of this group"));
            }

            // TODO: Implement actual join logic in GroupService
            // For now, return group info
            return Ok(ApiResponse<GroupResponse>.SuccessResponse(group));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error joining group with code {InvitationCode}", invitationCode);
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "SERVER_ERROR",
                "An error occurred while joining the group"));
        }
    }

    /// <summary>
    /// Promote member to Admin (Admin only)
    /// </summary>
    [HttpPost("{groupId}/members/{userId}/promote")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> PromoteMember(string groupId, string userId)
    {
        try
        {
            // TODO: Implement PromoteMemberAsync in GroupService
            return Ok(ApiResponse<object>.SuccessResponse(new { message = "Member promoted successfully" }));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "NOT_FOUND",
                "Group or member not found"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<object>.ErrorResponse(
                "NOT_ADMIN",
                ex.Message));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error promoting member in group {GroupId}", groupId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "SERVER_ERROR",
                "An error occurred while promoting the member"));
        }
    }

    /// <summary>
    /// Remove member from group (Admin only)
    /// </summary>
    [HttpDelete("{groupId}/members/{userId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveMember(string groupId, string userId)
    {
        try
        {
            // TODO: Implement RemoveMemberAsync in GroupService
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "NOT_FOUND",
                "Group or member not found"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<object>.ErrorResponse(
                "NOT_ADMIN",
                ex.Message));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "CANNOT_REMOVE_SELF",
                ex.Message));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error removing member from group {GroupId}", groupId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "SERVER_ERROR",
                "An error occurred while removing the member"));
        }
    }
}
