namespace TasksTracker.Api.Features.Groups.Models;

/// <summary>
/// Request to create a code-based invitation
/// </summary>
public record CreateCodeInviteRequest
{
    /// <summary>
    /// Target email address (null for "any user" invitations)
    /// </summary>
    public string? Email { get; init; }
}

/// <summary>
/// Response after creating a code invitation
/// </summary>
public record CodeInviteResponse
{
    public required string Code { get; init; }
    public string? Email { get; init; }
    public required string GroupId { get; init; }
    public DateTime CreatedAt { get; init; }
}

/// <summary>
/// Request to redeem an invitation code
/// </summary>
public record RedeemCodeInviteRequest
{
    public required string Code { get; init; }
}

/// <summary>
/// Response after redeeming a code
/// </summary>
public record RedeemCodeInviteResponse
{
    public required string GroupId { get; init; }
    public required string GroupName { get; init; }
    public required string Message { get; init; }
}

/// <summary>
/// DTO for invitation record display
/// </summary>
public record CodeInviteDto
{
    public required string Id { get; init; }
    public required string GroupId { get; init; }
    public required string Code { get; init; }
    public string? Email { get; init; }
    public required string InvitedBy { get; init; }
    public required string InvitedByName { get; init; }
    public required string Status { get; init; }
    public string? UsedBy { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UsedAt { get; init; }
}

/// <summary>
/// Response containing list of invitations
/// </summary>
public record CodeInvitesListResponse
{
    public required List<CodeInviteDto> Invites { get; init; }
    public int Total { get; init; }
}
