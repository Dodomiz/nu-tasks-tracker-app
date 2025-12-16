using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Features.Groups.Models;

namespace TasksTracker.Api.Features.Groups.Services;

public interface IGroupService
{
    Task<GroupResponse> CreateGroupAsync(CreateGroupRequest request, string userId);
    Task<GroupResponse> GetGroupAsync(string groupId, string userId);
    Task<GroupsResponse> GetUserGroupsAsync(string userId, int page = 1, int pageSize = 50);
    Task<GroupResponse> UpdateGroupAsync(string groupId, UpdateGroupRequest request, string userId);
    Task DeleteGroupAsync(string groupId, string userId);
    Task<GroupResponse> JoinGroupByInvitationAsync(string invitationCode, string userId);
    Task PromoteMemberAsync(string groupId, string targetUserId, string requestingUserId);
    Task RemoveMemberAsync(string groupId, string targetUserId, string requestingUserId);
}
