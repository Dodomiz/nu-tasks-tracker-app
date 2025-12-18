using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TasksTracker.Api.Core.Attributes;
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
    IInvitesService invitesService,
    ICodeInvitesService codeInvitesService,
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
    [RequireGroupMember]
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
    [RequireGroupAdmin]
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
    [RequireGroupAdmin]
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
    [RequireGroupAdmin]
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
            var response = await groupService.JoinGroupByInvitationAsync(invitationCode, UserId);
            logger.LogInformation("User {UserId} joined group {GroupId}", UserId, response.Id);
            return Ok(ApiResponse<GroupResponse>.SuccessResponse(response));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "INVALID_CODE",
                "Invitation code is invalid or group not found"));
        }
        catch (InvalidOperationException ex)
        {
            var errorCode = ex.Message.Contains("already a member") ? "ALREADY_MEMBER" : "MEMBER_LIMIT";
            return BadRequest(ApiResponse<object>.ErrorResponse(errorCode, ex.Message));
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
    [RequireGroupAdmin(groupIdParam: "groupId")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> PromoteMember(string groupId, string userId)
    {
        try
        {
            await groupService.PromoteMemberAsync(groupId, userId, UserId);
            return Ok(ApiResponse<object>.SuccessResponse(new { message = "Member promoted to admin successfully" }));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "NOT_FOUND",
                ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "ALREADY_ADMIN",
                ex.Message));
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
    /// Demote member to Regular User (Admin only)
    /// </summary>
    [HttpPost("{groupId}/members/{userId}/demote")]
    [RequireGroupAdmin(groupIdParam: "groupId")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DemoteMember(string groupId, string userId)
    {
        try
        {
            await groupService.DemoteMemberAsync(groupId, userId, UserId);
            return Ok(ApiResponse<object>.SuccessResponse(new { message = "Member demoted to regular user successfully" }));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "NOT_FOUND",
                ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "INVALID_OPERATION",
                ex.Message));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<object>.ErrorResponse(
                "NOT_ADMIN",
                ex.Message));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error demoting member in group {GroupId}", groupId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "SERVER_ERROR",
                "An error occurred while demoting the member"));
        }
    }

    /// <summary>
    /// Remove member from group (Admin only)
    /// </summary>
    [HttpDelete("{groupId}/members/{userId}")]
    [RequireGroupAdmin(groupIdParam: "groupId")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveMember(string groupId, string userId)
    {
        try
        {
            await groupService.RemoveMemberAsync(groupId, userId, UserId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "NOT_FOUND",
                ex.Message));
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
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "LAST_ADMIN",
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

    // ========== New Invites Endpoints (FR-025) ==========

    /// <summary>
    /// Create invite for group via email (Admin only)
    /// </summary>
    [HttpPost("{groupId}/invites")]
    [RequireGroupAdmin(groupIdParam: "groupId")]
    [ProducesResponseType(typeof(ApiResponse<InviteDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateInvite(string groupId, [FromBody] InviteMemberRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "VALIDATION_ERROR",
                "Invalid email address"));
        }

        try
        {
            var invite = await invitesService.CreateInviteAsync(groupId, request.Email, UserId);
            logger.LogInformation("Invite {InviteId} created for group {GroupId} by user {UserId}", 
                invite.Id, groupId, UserId);
            
            return CreatedAtAction(
                nameof(GetInvites),
                new { groupId },
                ApiResponse<InviteDto>.SuccessResponse(invite));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "VALIDATION_ERROR",
                ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "INVITE_ERROR",
                ex.Message));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<object>.ErrorResponse(
                "NOT_ADMIN",
                ex.Message));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "GROUP_NOT_FOUND",
                ex.Message));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating invite for group {GroupId}", groupId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "SERVER_ERROR",
                "An error occurred while creating the invite"));
        }
    }

    /// <summary>
    /// Get all invites for a group (Admin only)
    /// </summary>
    [HttpGet("{groupId}/invites")]
    [RequireGroupAdmin(groupIdParam: "groupId")]
    [ProducesResponseType(typeof(ApiResponse<List<InviteDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetInvites(string groupId)
    {
        try
        {
            var invites = await invitesService.GetGroupInvitesAsync(groupId, UserId);
            return Ok(ApiResponse<List<InviteDto>>.SuccessResponse(invites));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "GROUP_NOT_FOUND",
                ex.Message));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<object>.ErrorResponse(
                "NOT_MEMBER",
                ex.Message));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching invites for group {GroupId}", groupId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "SERVER_ERROR",
                "An error occurred while fetching invites"));
        }
    }

    /// <summary>
    /// Resend invite email (Admin only)
    /// </summary>
    [HttpPost("{groupId}/invites/{inviteId}/resend")]
    [RequireGroupAdmin(groupIdParam: "groupId")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResendInvite(string groupId, string inviteId)
    {
        try
        {
            await invitesService.ResendInviteAsync(groupId, inviteId, UserId);
            return Ok(ApiResponse<object>.SuccessResponse(new { message = "Invite resent successfully" }));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "NOT_FOUND",
                ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "INVALID_STATUS",
                ex.Message));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<object>.ErrorResponse(
                "NOT_ADMIN",
                ex.Message));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error resending invite {InviteId}", inviteId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "SERVER_ERROR",
                "An error occurred while resending the invite"));
        }
    }

    /// <summary>
    /// Cancel invite (Admin only)
    /// </summary>
    [HttpDelete("{groupId}/invites/{inviteId}")]
    [RequireGroupAdmin(groupIdParam: "groupId")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CancelInvite(string groupId, string inviteId)
    {
        try
        {
            await invitesService.CancelInviteAsync(groupId, inviteId, UserId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "NOT_FOUND",
                ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "INVALID_STATUS",
                ex.Message));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<object>.ErrorResponse(
                "NOT_ADMIN",
                ex.Message));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error canceling invite {InviteId}", inviteId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "SERVER_ERROR",
                "An error occurred while canceling the invite"));
        }
    }

        /// <summary>
        /// Get all members of a group with hydrated user details (All members)
        /// </summary>
        [HttpGet("{groupId}/members")]
        [ProducesResponseType(typeof(ApiResponse<List<MemberDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetMembers(string groupId)
        {
            try
            {
                var members = await groupService.GetGroupMembersAsync(groupId, UserId);
                return Ok(ApiResponse<List<MemberDto>>.SuccessResponse(members));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.ErrorResponse(
                    "GROUP_NOT_FOUND",
                    ex.Message));
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, ApiResponse<object>.ErrorResponse(
                    "NOT_MEMBER",
                    ex.Message));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error fetching members for group {GroupId}", groupId);
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "SERVER_ERROR",
                    "An error occurred while fetching members"));
            }
        }

    /// <summary>
    /// Create a code-based invitation for the group (FR-026)
    /// </summary>
    [HttpPost("{groupId}/code-invites")]
    [ProducesResponseType(typeof(ApiResponse<CodeInviteResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateCodeInvite(
        string groupId,
        [FromBody] CreateCodeInviteRequest request)
    {
        try
        {
            var response = await codeInvitesService.CreateInviteAsync(
                groupId,
                UserId,
                request.Email);

            logger.LogInformation(
                "Code invitation created for group {GroupId} by user {UserId}",
                groupId, UserId);

            return CreatedAtAction(
                nameof(GetCodeInvites),
                new { groupId },
                ApiResponse<CodeInviteResponse>.SuccessResponse(response));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "GROUP_NOT_FOUND",
                ex.Message));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<object>.ErrorResponse(
                "NOT_AUTHORIZED",
                ex.Message));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "VALIDATION_ERROR",
                ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "OPERATION_ERROR",
                ex.Message));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating code invitation for group {GroupId}", groupId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "SERVER_ERROR",
                "An error occurred while creating the invitation"));
        }
    }

    /// <summary>
    /// Get all code-based invitations for a group (FR-026)
    /// </summary>
    [HttpGet("{groupId}/code-invites")]
    [ProducesResponseType(typeof(ApiResponse<CodeInvitesListResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCodeInvites(string groupId)
    {
        try
        {
            var invites = await codeInvitesService.GetGroupInvitesAsync(groupId, UserId);
            var response = new CodeInvitesListResponse { Invites = invites };

            return Ok(ApiResponse<CodeInvitesListResponse>.SuccessResponse(response));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "GROUP_NOT_FOUND",
                ex.Message));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<object>.ErrorResponse(
                "NOT_AUTHORIZED",
                ex.Message));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching code invitations for group {GroupId}", groupId);
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "SERVER_ERROR",
                "An error occurred while fetching invitations"));
        }
    }
}
