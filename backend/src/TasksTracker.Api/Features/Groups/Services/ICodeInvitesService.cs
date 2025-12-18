using TasksTracker.Api.Features.Groups.Models;

namespace TasksTracker.Api.Features.Groups.Services;

/// <summary>
/// Service interface for code-based invitations (FR-026)
/// </summary>
public interface ICodeInvitesService
{
    /// <summary>
    /// Creates a new code-based invitation
    /// </summary>
    Task<CodeInviteResponse> CreateInviteAsync(
        string groupId,
        string adminUserId,
        string? email,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all invitations for a group
    /// </summary>
    Task<List<CodeInviteDto>> GetGroupInvitesAsync(
        string groupId,
        string userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Redeems an invitation code
    /// </summary>
    Task<RedeemCodeInviteResponse> RedeemInviteAsync(
        string code,
        string userId,
        string userEmail,
        CancellationToken cancellationToken = default);
}
