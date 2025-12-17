using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Core.Interfaces;
using TasksTracker.Api.Features.Dashboard.Models;

namespace TasksTracker.Api.Features.Dashboard.Services;

public class DashboardService(IGroupRepository groupRepository, IUserRepository userRepository) : IDashboardService
{
    public async Task<DashboardResponse> GetDashboardAsync(string userId, int page, int pageSize, CancellationToken ct)
    {
        var allGroups = await groupRepository.GetUserGroupsAsync(userId);
        var ordered = allGroups
            .OrderByDescending(g => g.LastActivity)
            .ToList();

        var total = ordered.Count;
        var skip = Math.Max(0, (page - 1) * pageSize);
        var paged = ordered.Skip(skip).Take(pageSize).ToList();

        var userIds = new HashSet<string>();
        var selection = new List<(Group group, List<GroupMember> admins, List<GroupMember> recentMembers)>();

        foreach (var group in paged)
        {
            var admins = group.Members
                .Where(m => m.Role == GroupRole.Admin)
                .OrderBy(m => m.JoinedAt)
                .Take(3)
                .ToList();

            var recentMembers = group.Members
                .Where(m => m.Role != GroupRole.Admin)
                .OrderByDescending(m => m.JoinedAt)
                .Take(7)
                .ToList();

            foreach (var m in admins) userIds.Add(m.UserId);
            foreach (var m in recentMembers) userIds.Add(m.UserId);

            selection.Add((group, admins, recentMembers));
        }

        var users = userIds.Count > 0
            ? await userRepository.GetByIdsAsync(userIds.ToList(), ct)
            : new List<User>();

        var byId = users.ToDictionary(u => u.Id, u => u);

        var groupsDto = new List<GroupCardDto>();
        foreach (var (group, admins, recentMembers) in selection)
        {
            var myRole = group.Members.FirstOrDefault(m => m.UserId == userId)?.Role == GroupRole.Admin ? "Admin" : "Member";

            var adminsDto = admins.Select(m => new MemberSummaryDto
            {
                UserId = m.UserId,
                FirstName = byId.TryGetValue(m.UserId, out var u1) ? u1.FirstName : string.Empty,
                LastName = byId.TryGetValue(m.UserId, out var u2) ? u2.LastName : string.Empty,
                AvatarUrl = byId.TryGetValue(m.UserId, out var u3) ? u3.ProfilePhotoUrl : null,
                Role = "Admin",
                JoinedAt = m.JoinedAt
            }).ToList();

            var membersDto = recentMembers.Select(m => new MemberSummaryDto
            {
                UserId = m.UserId,
                FirstName = byId.TryGetValue(m.UserId, out var u1) ? u1.FirstName : string.Empty,
                LastName = byId.TryGetValue(m.UserId, out var u2) ? u2.LastName : string.Empty,
                AvatarUrl = byId.TryGetValue(m.UserId, out var u3) ? u3.ProfilePhotoUrl : null,
                Role = "Member",
                JoinedAt = m.JoinedAt
            }).ToList();

            groupsDto.Add(new GroupCardDto
            {
                Id = group.Id,
                Name = group.Name,
                Description = group.Description,
                MemberCount = group.Members.Count,
                TaskCount = group.TaskCount,
                LastActivity = group.LastActivity,
                Admins = adminsDto,
                RecentMembers = membersDto,
                MyRole = myRole
            });
        }

        return new DashboardResponse
        {
            Groups = groupsDto,
            Total = total,
            CurrentPage = page,
            PageSize = pageSize,
            HasMore = skip + groupsDto.Count < total
        };
    }
}
