using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Features.Groups.Models;
using TasksTracker.Api.Features.Groups.Services;

namespace TasksTracker.Api.Features.Groups.Controllers;

/// <summary>
/// Controller for code-based invitation redemption (FR-026)
/// </summary>
[ApiController]
[Route("api/code-invites")]
[Authorize]
public class CodeInvitesController(
    ICodeInvitesService codeInvitesService,
    ILogger<CodeInvitesController> logger) : ControllerBase
{
    private string UserId => User.FindFirst(ClaimTypes.NameIdentifier)?.Value
        ?? throw new UnauthorizedAccessException("User ID not found in token");

    private string UserEmail => User.FindFirst(ClaimTypes.Email)?.Value
        ?? throw new UnauthorizedAccessException("User email not found in token");

    /// <summary>
    /// Redeem an invitation code to join a group
    /// </summary>
    [HttpPost("redeem")]
    [ProducesResponseType(typeof(ApiResponse<RedeemCodeInviteResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RedeemInvite([FromBody] RedeemCodeInviteRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Code))
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "VALIDATION_ERROR",
                "Invitation code is required"));
        }

        try
        {
            var response = await codeInvitesService.RedeemInviteAsync(
                request.Code,
                UserId,
                UserEmail);

            logger.LogInformation(
                "User {UserId} redeemed invitation code {Code} for group {GroupId}",
                UserId, request.Code, response.GroupId);

            return Ok(ApiResponse<RedeemCodeInviteResponse>.SuccessResponse(response));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(
                "INVALID_CODE",
                ex.Message));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, ApiResponse<object>.ErrorResponse(
                "NOT_AUTHORIZED",
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
            logger.LogError(ex, "Error redeeming invitation code {Code}", request.Code);
            return StatusCode(500, ApiResponse<object>.ErrorResponse(
                "SERVER_ERROR",
                "An error occurred while redeeming the invitation"));
        }
    }
}
