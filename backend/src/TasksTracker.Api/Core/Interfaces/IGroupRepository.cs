using TasksTracker.Api.Core.Domain;

namespace TasksTracker.Api.Core.Interfaces;

public interface IGroupRepository
{
    Task<Group?> GetByIdAsync(string id);
    Task<Group?> GetByInvitationCodeAsync(string invitationCode);
    Task<List<Group>> GetUserGroupsAsync(string userId);
    Task<Group> CreateAsync(Group group);
    Task<Group> UpdateAsync(Group group);
    Task<bool> DeleteAsync(string id);
}
