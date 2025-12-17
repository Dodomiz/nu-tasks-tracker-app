using TasksTracker.Api.Core.Domain;

namespace TasksTracker.Api.Core.Interfaces;

public interface IInvitesRepository
{
    Task<Invite> CreateAsync(Invite invite);
    Task<Invite?> GetByIdAsync(string id);
    Task<Invite?> GetByTokenAsync(string token);
    Task<List<Invite>> GetByGroupIdAsync(string groupId, InviteStatus? status = null);
    Task<Invite?> GetPendingInviteAsync(string groupId, string email);
    Task UpdateAsync(string id, Invite invite);
    Task DeleteAsync(string id);
}
