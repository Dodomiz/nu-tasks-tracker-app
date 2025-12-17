using System.Text.RegularExpressions;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Core.Interfaces;
using TasksTracker.Api.Features.Groups.Models;

namespace TasksTracker.Api.Features.Groups.Services;

public partial class InvitesService(
    IInvitesRepository invitesRepository,
    IGroupRepository groupRepository,
    IUserRepository userRepository,
    IInvitationService invitationService,
    ILogger<InvitesService> logger) : IInvitesService
{
    private const int MaxEmailLength = 254;
    
    [GeneratedRegex(@"^[^\s@]+@[^\s@]+\.[^\s@]+$")]
    private static partial Regex EmailRegex();

    public async Task<InviteDto> CreateInviteAsync(string groupId, string email, string invitedByUserId)
    {
        logger.LogInformation("Creating invite for {Email} in group {GroupId} by user {UserId}", 
            email, groupId, invitedByUserId);

        // 1. Validate email format
        if (string.IsNullOrWhiteSpace(email) || email.Length > MaxEmailLength)
        {
            throw new ArgumentException($"Email must be between 1 and {MaxEmailLength} characters");
        }

        if (!EmailRegex().IsMatch(email))
        {
            throw new ArgumentException("Invalid email format");
        }

        email = email.ToLowerInvariant();

        // 2. Validate group exists and user is Admin
        var group = await groupRepository.GetByIdAsync(groupId) 
            ?? throw new KeyNotFoundException($"Group {groupId} not found");

        var inviter = group.Members.FirstOrDefault(m => m.UserId == invitedByUserId);
        if (inviter == null)
        {
            throw new UnauthorizedAccessException("You are not a member of this group");
        }

        if (inviter.Role != GroupRole.Admin)
        {
            throw new UnauthorizedAccessException("Only admins can invite members");
        }

        // 3. Check if email already a member
        var existingMember = group.Members.Any(m =>
        {
            var user = userRepository.GetByIdAsync(m.UserId).Result;
            return user?.Email.ToLowerInvariant() == email;
        });

        if (existingMember)
        {
            throw new InvalidOperationException($"{email} is already a member of this group");
        }

        // 4. Check if pending invite exists
        var pendingInvite = await invitesRepository.GetPendingInviteAsync(groupId, email);
        if (pendingInvite != null)
        {
            throw new InvalidOperationException(
                $"A pending invite for {email} already exists. Use resend if needed.");
        }

        // 5. Check group capacity
        if (group.Members.Count >= group.Settings.MaxMembers)
        {
            throw new InvalidOperationException(
                $"Group has reached maximum capacity ({group.Settings.MaxMembers} members)");
        }

        // 6. Generate token
        var token = Guid.NewGuid().ToString();

        // 7. Create invite entity
        var invite = new Invite
        {
            GroupId = groupId,
            Email = email,
            Status = InviteStatus.Pending,
            Token = token,
            InvitedBy = invitedByUserId,
            InvitedAt = DateTime.UtcNow,
            LastSentAt = DateTime.UtcNow,
            SendCount = 1
        };

        // 8. Save to DB
        var createdInvite = await invitesRepository.CreateAsync(invite);

        // 9. Send email
        try
        {
            await invitationService.SendInvitationAsync(email, group.Name, token, invitedByUserId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send invitation email to {Email}", email);
            // Continue - invite is created, email failure is non-blocking
        }

        // 10. Return DTO
        var inviterUser = await userRepository.GetByIdAsync(invitedByUserId);
        return MapToDto(createdInvite, inviterUser);
    }

    public async Task ResendInviteAsync(string groupId, string inviteId, string userId)
    {
        logger.LogInformation("Resending invite {InviteId} in group {GroupId} by user {UserId}", 
            inviteId, groupId, userId);

        // 1. Validate user is Admin
        var group = await groupRepository.GetByIdAsync(groupId) 
            ?? throw new KeyNotFoundException($"Group {groupId} not found");

        var member = group.Members.FirstOrDefault(m => m.UserId == userId);
        if (member?.Role != GroupRole.Admin)
        {
            throw new UnauthorizedAccessException("Only admins can resend invites");
        }

        // 2. Get invite and check status
        var invite = await invitesRepository.GetByIdAsync(inviteId) 
            ?? throw new KeyNotFoundException($"Invite {inviteId} not found");

        if (invite.GroupId != groupId)
        {
            throw new ArgumentException("Invite does not belong to this group");
        }

        if (invite.Status != InviteStatus.Pending)
        {
            throw new InvalidOperationException($"Cannot resend invite with status {invite.Status}");
        }

        // 3. Update invite
        invite.SendCount++;
        invite.LastSentAt = DateTime.UtcNow;
        await invitesRepository.UpdateAsync(inviteId, invite);

        // 4. Resend email
        try
        {
            await invitationService.SendInvitationAsync(
                invite.Email, group.Name, invite.Token, userId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to resend invitation email to {Email}", invite.Email);
            throw new InvalidOperationException("Failed to send email. Please try again.");
        }

        logger.LogInformation("Invite {InviteId} resent successfully. Send count: {SendCount}", 
            inviteId, invite.SendCount);
    }

    public async Task CancelInviteAsync(string groupId, string inviteId, string userId)
    {
        logger.LogInformation("Canceling invite {InviteId} in group {GroupId} by user {UserId}", 
            inviteId, groupId, userId);

        // 1. Validate user is Admin
        var group = await groupRepository.GetByIdAsync(groupId) 
            ?? throw new KeyNotFoundException($"Group {groupId} not found");

        var member = group.Members.FirstOrDefault(m => m.UserId == userId);
        if (member?.Role != GroupRole.Admin)
        {
            throw new UnauthorizedAccessException("Only admins can cancel invites");
        }

        // 2. Get invite and check status
        var invite = await invitesRepository.GetByIdAsync(inviteId) 
            ?? throw new KeyNotFoundException($"Invite {inviteId} not found");

        if (invite.GroupId != groupId)
        {
            throw new ArgumentException("Invite does not belong to this group");
        }

        if (invite.Status != InviteStatus.Pending)
        {
            throw new InvalidOperationException($"Cannot cancel invite with status {invite.Status}");
        }

        // 3. Update status to Canceled
        invite.Status = InviteStatus.Canceled;
        invite.RespondedAt = DateTime.UtcNow;
        await invitesRepository.UpdateAsync(inviteId, invite);

        logger.LogInformation("Invite {InviteId} canceled successfully", inviteId);
    }

    public async Task<List<InviteDto>> GetGroupInvitesAsync(string groupId, string userId)
    {
        logger.LogInformation("Fetching invites for group {GroupId} by user {UserId}", groupId, userId);

        // 1. Validate user is member
        var group = await groupRepository.GetByIdAsync(groupId) 
            ?? throw new KeyNotFoundException($"Group {groupId} not found");

        var member = group.Members.FirstOrDefault(m => m.UserId == userId);
        if (member == null)
        {
            throw new UnauthorizedAccessException("You are not a member of this group");
        }

        // 2. If not Admin, return empty (policy: only Admins see invites)
        if (member.Role != GroupRole.Admin)
        {
            return new List<InviteDto>();
        }

        // 3. Get invites (Pending, Joined, Declined; exclude Canceled)
        var invites = await invitesRepository.GetByGroupIdAsync(groupId);
        var filteredInvites = invites
            .Where(i => i.Status != InviteStatus.Canceled)
            .ToList();

        // 4. Hydrate invitedBy user names
        var inviterIds = filteredInvites.Select(i => i.InvitedBy).Distinct().ToList();
        var inviters = new Dictionary<string, User>();
        
        foreach (var inviterId in inviterIds)
        {
            var user = await userRepository.GetByIdAsync(inviterId);
            if (user != null)
            {
                inviters[inviterId] = user;
            }
        }

        return filteredInvites.Select(i => MapToDto(i, inviters.GetValueOrDefault(i.InvitedBy))).ToList();
    }

    private static InviteDto MapToDto(Invite invite, User? inviter)
    {
        return new InviteDto
        {
            Id = invite.Id,
            GroupId = invite.GroupId,
            Email = invite.Email,
            Status = invite.Status.ToString(),
            InvitedBy = invite.InvitedBy,
            InvitedByName = inviter != null ? $"{inviter.FirstName} {inviter.LastName}" : "Unknown",
            InvitedAt = invite.InvitedAt,
            RespondedAt = invite.RespondedAt,
            SendCount = invite.SendCount
        };
    }
}
