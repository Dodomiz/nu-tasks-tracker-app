using System.Text.RegularExpressions;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Core.Interfaces;
using TasksTracker.Api.Core.Services;
using TasksTracker.Api.Features.Groups.Models;
using TasksTracker.Api.Features.Notifications.Services;
using TasksTracker.Api.Features.Notifications.Models;

namespace TasksTracker.Api.Features.Groups.Services;

/// <summary>
/// Service for managing code-based invitations (FR-026)
/// </summary>
public partial class CodeInvitesService(
    ICodeInvitesRepository codeInvitesRepository,
    IGroupRepository groupRepository,
    IUserRepository userRepository,
    CodeGeneratorService codeGenerator,
    NotificationService notificationService,
    ILogger<CodeInvitesService> logger) : ICodeInvitesService
{
    private const int MaxEmailLength = 254;
    private const int MaxCodeGenerationAttempts = 10;

    [GeneratedRegex(@"^[^\s@]+@[^\s@]+\.[^\s@]+$")]
    private static partial Regex EmailRegex();

    public async Task<CodeInviteResponse> CreateInviteAsync(
        string groupId,
        string adminUserId,
        string? email,
        CancellationToken cancellationToken = default)
    {
        logger.LogInformation(
            "Creating code invitation for group {GroupId} by user {UserId}, email: {Email}",
            groupId, adminUserId, email ?? "any");

        // Validate email format if provided
        if (!string.IsNullOrWhiteSpace(email))
        {
            if (email.Length > MaxEmailLength)
            {
                throw new ArgumentException($"Email must be {MaxEmailLength} characters or less");
            }

            if (!EmailRegex().IsMatch(email))
            {
                throw new ArgumentException("Invalid email format");
            }

            email = email.ToLowerInvariant();
        }
        else
        {
            email = null;
        }

        // Validate group exists and user is admin
        var group = await groupRepository.GetByIdAsync(groupId)
            ?? throw new KeyNotFoundException($"Group {groupId} not found");

        var admin = group.Members.FirstOrDefault(m => m.UserId == adminUserId);
        if (admin == null)
        {
            throw new UnauthorizedAccessException("You are not a member of this group");
        }

        if (admin.Role != GroupRole.Admin)
        {
            throw new UnauthorizedAccessException("Only admins can create invitations");
        }

        // Check if user already a member (if email specified)
        if (!string.IsNullOrEmpty(email))
        {
            var user = await userRepository.GetByEmailAsync(email);
            if (user != null)
            {
                var isMember = group.Members.Any(m => m.UserId == user.Id);
                if (isMember)
                {
                    throw new InvalidOperationException("User is already a member of this group");
                }
            }
        }

        // Generate unique code
        var code = await GenerateUniqueCodeAsync(cancellationToken);

        // Create invite
        var invite = new CodeInvite
        {
            GroupId = groupId,
            Code = code,
            Email = email,
            InvitedBy = adminUserId,
            Status = CodeInviteStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        await codeInvitesRepository.CreateAsync(invite, cancellationToken);

        logger.LogInformation(
            "Code invitation created: Code={Code}, GroupId={GroupId}, Email={Email}",
            code, groupId, email ?? "any");
        
        // Create notification if email is specified and user exists
        if (!string.IsNullOrEmpty(email))
        {
            try
            {
                var targetUser = await userRepository.GetByEmailAsync(email);
                if (targetUser != null)
                {
                    var inviterUser = await userRepository.GetByIdAsync(adminUserId);
                    await notificationService.CreateNotificationAsync(new CreateNotificationRequest(
                        UserId: targetUser.Id,
                        Type: NotificationType.GROUP_INVITATION_RECEIVED,
                        Content: new NotificationContentDto(
                            Title: "Group Invitation Received",
                            Body: $"{inviterUser?.FirstName} {inviterUser?.LastName} invited you to join '{group.Name}'",
                            Metadata: new Dictionary<string, object>
                            {
                                ["groupId"] = groupId,
                                ["groupName"] = group.Name,
                                ["inviteCode"] = code
                            }
                        )
                    ), cancellationToken);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to create GROUP_INVITATION_RECEIVED notification for code {Code}", code);
            }
        }

        return new CodeInviteResponse
        {
            Code = code,
            Email = email,
            GroupId = groupId,
            CreatedAt = invite.CreatedAt
        };
    }

    public async Task<RedeemCodeInviteResponse> RedeemInviteAsync(
        string code,
        string userId,
        string userEmail,
        CancellationToken cancellationToken = default)
    {
        logger.LogInformation(
            "Redeeming invitation code {Code} for user {UserId}",
            code, userId);

        // Normalize code to uppercase
        code = code.ToUpperInvariant();

        // Find invite by code
        var invite = await codeInvitesRepository.GetByCodeAsync(code, cancellationToken)
            ?? throw new KeyNotFoundException("Invalid invitation code");

        // Check if already used
        if (invite.Status == CodeInviteStatus.Approved)
        {
            throw new InvalidOperationException("This invitation has already been used");
        }

        // Validate email if invite is email-specific
        if (!string.IsNullOrEmpty(invite.Email))
        {
            if (!userEmail.Equals(invite.Email, StringComparison.OrdinalIgnoreCase))
            {
                throw new UnauthorizedAccessException(
                    "This invitation is for a different email address");
            }
        }

        // Get group
        var group = await groupRepository.GetByIdAsync(invite.GroupId)
            ?? throw new KeyNotFoundException($"Group {invite.GroupId} not found");

        // Check if user already a member
        var isMember = group.Members.Any(m => m.UserId == userId);
        if (isMember)
        {
            throw new InvalidOperationException("You are already a member of this group");
        }

        // Check member limit
        if (group.Members.Count >= 20)
        {
            throw new InvalidOperationException("Group has reached maximum of 20 members");
        }

        // Add user to group
        var newMember = new GroupMember
        {
            UserId = userId,
            Role = GroupRole.RegularUser,
            JoinedAt = DateTime.UtcNow,
            InvitedBy = invite.InvitedBy
        };

        group.Members.Add(newMember);

        try
        {
            await groupRepository.UpdateAsync(group);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating group {GroupId} during code redemption", group.Id);
            throw;
        }

        // Update invite status
        invite.Status = CodeInviteStatus.Approved;
        invite.UsedBy = userId;
        invite.UsedAt = DateTime.UtcNow;

        await codeInvitesRepository.UpdateAsync(invite, cancellationToken);

        logger.LogInformation(
            "Code invitation redeemed: Code={Code}, UserId={UserId}, GroupId={GroupId}",
            code, userId, invite.GroupId);
        
        // Create notifications
        try
        {
            var joiningUser = await userRepository.GetByIdAsync(userId);
            
            // Notify existing group members about new member
            foreach (var member in group.Members.Where(m => m.UserId != userId))
            {
                await notificationService.CreateNotificationAsync(new CreateNotificationRequest(
                    UserId: member.UserId,
                    Type: NotificationType.GROUP_MEMBER_JOINED,
                    Content: new NotificationContentDto(
                        Title: "New Member Joined",
                        Body: $"{joiningUser?.FirstName} {joiningUser?.LastName} joined group '{group.Name}'",
                        Metadata: new Dictionary<string, object>
                        {
                            ["groupId"] = group.Id,
                            ["groupName"] = group.Name,
                            ["newMemberId"] = userId
                        }
                    )
                ), cancellationToken);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to create GROUP_MEMBER_JOINED notifications for group {GroupId}", group.Id);
        }

        return new RedeemCodeInviteResponse
        {
            GroupId = group.Id,
            GroupName = group.Name,
            Message = $"Successfully joined {group.Name}"
        };
    }

    public async Task<List<CodeInviteDto>> GetGroupInvitesAsync(
        string groupId,
        string userId,
        CancellationToken cancellationToken = default)
    {
        // Validate group exists and user is admin
        var group = await groupRepository.GetByIdAsync(groupId)
            ?? throw new KeyNotFoundException($"Group {groupId} not found");

        var member = group.Members.FirstOrDefault(m => m.UserId == userId);
        if (member == null)
        {
            throw new UnauthorizedAccessException("You are not a member of this group");
        }

        if (member.Role != GroupRole.Admin)
        {
            throw new UnauthorizedAccessException("Only admins can view invitations");
        }

        // Get all invitations for group
        var invites = await codeInvitesRepository.GetByGroupIdAsync(groupId, null, cancellationToken);

        // Populate inviter names
        var inviteDtos = new List<CodeInviteDto>();
        foreach (var invite in invites)
        {
            var inviter = await userRepository.GetByIdAsync(invite.InvitedBy);
            inviteDtos.Add(new CodeInviteDto
            {
                Id = invite.Id,
                GroupId = invite.GroupId,
                Code = invite.Code,
                Email = invite.Email,
                InvitedBy = invite.InvitedBy,
                InvitedByName = inviter?.FullName ?? "Unknown",
                Status = invite.Status.ToString().ToLower(),
                UsedBy = invite.UsedBy,
                CreatedAt = invite.CreatedAt,
                UsedAt = invite.UsedAt
            });
        }

        return inviteDtos;
    }

    private async Task<string> GenerateUniqueCodeAsync(CancellationToken cancellationToken)
    {
        for (var i = 0; i < MaxCodeGenerationAttempts; i++)
        {
            var code = codeGenerator.GenerateCode();
            var exists = await codeInvitesRepository.CodeExistsAsync(code, cancellationToken);
            if (!exists)
            {
                return code;
            }
        }

        throw new InvalidOperationException("Failed to generate unique invitation code after multiple attempts");
    }
}
