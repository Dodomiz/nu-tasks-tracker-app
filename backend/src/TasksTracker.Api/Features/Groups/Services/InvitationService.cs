using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TasksTracker.Api.Core.Interfaces;
using TasksTracker.Api.Features.Groups.Models;

namespace TasksTracker.Api.Features.Groups.Services;

public class InvitationService(
    IGroupRepository groupRepository,
    IUserRepository userRepository,
    IConfiguration configuration,
    ILogger<InvitationService> logger) : IInvitationService
{
    private readonly string _frontendUrl = configuration["App:FrontendUrl"] ?? "http://localhost:5173";

    public async Task<InviteResponse> SendInvitationAsync(
        string email, 
        string groupName, 
        string invitationCode, 
        string invitedByUserId)
    {
        logger.LogInformation("Sending invitation to {Email} for group {GroupName}", email, groupName);

        // Get inviter details
        var inviter = await userRepository.GetByIdAsync(invitedByUserId);
        var inviterName = inviter != null ? $"{inviter.FirstName} {inviter.LastName}" : "Someone";

        // Build invitation URL
        var invitationUrl = $"{_frontendUrl}/groups/join/{invitationCode}";

        // TODO: Integrate with SendGrid or email service
        // For now, we'll just log and return the URL
        logger.LogInformation(
            "Email invitation would be sent to {Email} from {InviterName} with URL: {InvitationUrl}",
            email, inviterName, invitationUrl);

        // In production, this would send an email via SendGrid:
        // await _emailService.SendAsync(email, "Group Invitation", BuildEmailTemplate(...));

        return new InviteResponse
        {
            Message = $"Invitation sent to {email}",
            InvitationUrl = invitationUrl
        };
    }

    public async Task<bool> ValidateInvitationCodeAsync(string invitationCode)
    {
        var group = await groupRepository.GetByInvitationCodeAsync(invitationCode);
        return group != null;
    }

    // TODO: Email template builder
    private string BuildEmailTemplate(string groupName, string inviterName, string invitationUrl)
    {
        return $@"
            <html>
            <body>
                <h2>You've been invited to join {groupName}!</h2>
                <p>{inviterName} has invited you to join their group on TasksTracker.</p>
                <p><a href=""{invitationUrl}"">Click here to join</a></p>
                <p>If the button doesn't work, copy and paste this URL into your browser:</p>
                <p>{invitationUrl}</p>
            </body>
            </html>
        ";
    }
}
