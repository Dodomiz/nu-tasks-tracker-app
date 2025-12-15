using TasksTracker.Api.Features.Groups.Models;

namespace TasksTracker.Api.Features.Groups.Services;

public interface IInvitationService
{
    Task<InviteResponse> SendInvitationAsync(string email, string groupName, string invitationCode, string invitedByUserId);
    Task<bool> ValidateInvitationCodeAsync(string invitationCode);
}
