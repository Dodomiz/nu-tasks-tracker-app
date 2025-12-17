using TasksTracker.Api.Features.Groups.Models;

namespace TasksTracker.Api.Features.Groups.Services;

public interface IInvitesService
{
    Task<InviteDto> CreateInviteAsync(string groupId, string email, string invitedByUserId);
    Task ResendInviteAsync(string groupId, string inviteId, string userId);
    Task CancelInviteAsync(string groupId, string inviteId, string userId);
    Task<List<InviteDto>> GetGroupInvitesAsync(string groupId, string userId);
}
