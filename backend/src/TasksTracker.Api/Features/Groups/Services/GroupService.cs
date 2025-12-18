using Microsoft.Extensions.Logging;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Core.Interfaces;
using TasksTracker.Api.Features.Groups.Extensions;
using TasksTracker.Api.Features.Groups.Models;

namespace TasksTracker.Api.Features.Groups.Services;

public class GroupService(
    IGroupRepository groupRepository,
    IUserRepository userRepository,
    ILogger<GroupService> logger) : IGroupService
{
    public async Task<GroupResponse> CreateGroupAsync(CreateGroupRequest request, string userId)
    {
        logger.LogInformation("Creating group {GroupName} for user {UserId}", request.Name, userId);

        // Validate name length
        if (request.Name.Length < 3 || request.Name.Length > 50)
        {
            throw new ArgumentException("Group name must be between 3 and 50 characters");
        }

        // Generate unique invitation code
        var invitationCode = Guid.NewGuid().ToString();

        // Create group entity
        var group = request.ToGroup(userId, invitationCode);

        // Save to database
        var createdGroup = await groupRepository.CreateAsync(group);

        logger.LogInformation("Group {GroupId} created successfully", createdGroup.Id);

        return createdGroup.ToGroupResponse(userId);
    }

    public async Task<GroupResponse> GetGroupAsync(string groupId, string userId)
    {
        var group = await groupRepository.GetByIdAsync(groupId);
        
        if (group == null)
        {
            throw new KeyNotFoundException($"Group {groupId} not found");
        }

        // Check if user is a member
        var isMember = group.Members.Any(m => m.UserId == userId);
        if (!isMember)
        {
            throw new UnauthorizedAccessException("You are not a member of this group");
        }

        var response = group.ToGroupResponse(userId);

        // Populate member details if admin
        var currentMember = group.Members.FirstOrDefault(m => m.UserId == userId);
        if (currentMember?.Role == GroupRole.Admin && response.Members != null)
        {
            await PopulateMemberDetailsAsync(response.Members);
        }

        return response;
    }

    public async Task<GroupsResponse> GetUserGroupsAsync(string userId, int page = 1, int pageSize = 50)
    {
        var groups = await groupRepository.GetUserGroupsAsync(userId);
        
        var groupResponses = groups
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(g => g.ToGroupResponse(userId))
            .ToList();

        return new GroupsResponse
        {
            Groups = groupResponses,
            Total = groups.Count
        };
    }

    public async Task<GroupResponse> UpdateGroupAsync(string groupId, UpdateGroupRequest request, string userId)
    {
        var group = await groupRepository.GetByIdAsync(groupId);
        
        if (group == null)
        {
            throw new KeyNotFoundException($"Group {groupId} not found");
        }

        // Check if user is admin
        var member = group.Members.FirstOrDefault(m => m.UserId == userId);
        if (member?.Role != GroupRole.Admin)
        {
            throw new UnauthorizedAccessException("Only admins can update group settings");
        }

        // Validate name length
        if (request.Name.Length < 3 || request.Name.Length > 50)
        {
            throw new ArgumentException("Group name must be between 3 and 50 characters");
        }

        // Update group
        group.UpdateFrom(request);
        var updatedGroup = await groupRepository.UpdateAsync(group);

        logger.LogInformation("Group {GroupId} updated by user {UserId}", groupId, userId);

        return updatedGroup.ToGroupResponse(userId);
    }

    public async Task DeleteGroupAsync(string groupId, string userId)
    {
        var group = await groupRepository.GetByIdAsync(groupId);
        
        if (group == null)
        {
            throw new KeyNotFoundException($"Group {groupId} not found");
        }

        // Check if user is admin
        var member = group.Members.FirstOrDefault(m => m.UserId == userId);
        if (member?.Role != GroupRole.Admin)
        {
            throw new UnauthorizedAccessException("Only admins can delete groups");
        }

        await groupRepository.DeleteAsync(groupId);

        logger.LogInformation("Group {GroupId} deleted by user {UserId}", groupId, userId);
    }

    public async Task<GroupResponse> JoinGroupByInvitationAsync(string invitationCode, string userId)
    {
        var group = await groupRepository.GetByInvitationCodeAsync(invitationCode);
        
        if (group == null)
        {
            throw new KeyNotFoundException($"Group with invitation code {invitationCode} not found");
        }

        // Check if user is already a member
        var existingMember = group.Members.FirstOrDefault(m => m.UserId == userId);
        if (existingMember != null)
        {
            throw new InvalidOperationException("You are already a member of this group");
        }

        // Check member limit with concurrency safety
        if (group.Members.Count >= 20)
        {
            throw new InvalidOperationException("Group has reached maximum of 20 members");
        }

        // Add user as regular member
        var newMember = new GroupMember
        {
            UserId = userId,
            Role = GroupRole.RegularUser,
            JoinedAt = DateTime.UtcNow
        };

        group.Members.Add(newMember);

        // Update group with optimistic concurrency
        try
        {
            await groupRepository.UpdateAsync(group);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Concurrency error while joining group {GroupId}", group.Id);
            // Re-check member count in case of concurrent joins
            var refreshedGroup = await groupRepository.GetByIdAsync(group.Id);
            if (refreshedGroup!.Members.Count >= 20)
            {
                throw new InvalidOperationException("Group has reached maximum of 20 members");
            }
            throw;
        }

        logger.LogInformation("User {UserId} joined group {GroupId} via invitation", userId, group.Id);

        return group.ToGroupResponse(userId);
    }

    public async Task PromoteMemberAsync(string groupId, string targetUserId, string requestingUserId)
    {
        var group = await groupRepository.GetByIdAsync(groupId);
        
        if (group == null)
        {
            throw new KeyNotFoundException($"Group {groupId} not found");
        }

        // Check if requesting user is admin
        var requestingMember = group.Members.FirstOrDefault(m => m.UserId == requestingUserId);
        if (requestingMember?.Role != GroupRole.Admin)
        {
            throw new UnauthorizedAccessException("Only admins can promote members");
        }

        // Find target member
        var targetMember = group.Members.FirstOrDefault(m => m.UserId == targetUserId);
        if (targetMember == null)
        {
            throw new KeyNotFoundException($"Member {targetUserId} not found in group {groupId}");
        }

        // Check if already admin
        if (targetMember.Role == GroupRole.Admin)
        {
            throw new InvalidOperationException("Member is already an admin");
        }

        // Promote to admin
        targetMember.Role = GroupRole.Admin;
        await groupRepository.UpdateAsync(group);

        logger.LogInformation("User {TargetUserId} promoted to admin in group {GroupId} by {RequestingUserId}", 
            targetUserId, groupId, requestingUserId);
    }

    public async Task DemoteMemberAsync(string groupId, string targetUserId, string requestingUserId)
    {
        var group = await groupRepository.GetByIdAsync(groupId);
        
        if (group == null)
        {
            throw new KeyNotFoundException($"Group {groupId} not found");
        }

        // Check if requesting user is admin
        var requestingMember = group.Members.FirstOrDefault(m => m.UserId == requestingUserId);
        if (requestingMember?.Role != GroupRole.Admin)
        {
            throw new UnauthorizedAccessException("Only admins can demote members");
        }

        // Find target member
        var targetMember = group.Members.FirstOrDefault(m => m.UserId == targetUserId);
        if (targetMember == null)
        {
            throw new KeyNotFoundException($"Member {targetUserId} not found in group {groupId}");
        }

        // Check if already regular user
        if (targetMember.Role == GroupRole.RegularUser)
        {
            throw new InvalidOperationException("Member is already a regular user");
        }

        // Check if this is the last admin
        var adminCount = group.Members.Count(m => m.Role == GroupRole.Admin);
        if (adminCount == 1 && targetMember.Role == GroupRole.Admin)
        {
            throw new InvalidOperationException("Cannot demote the last admin. Promote another member first.");
        }

        // Demote to regular user
        targetMember.Role = GroupRole.RegularUser;
        await groupRepository.UpdateAsync(group);

        logger.LogInformation("User {TargetUserId} demoted to regular user in group {GroupId} by {RequestingUserId}", 
            targetUserId, groupId, requestingUserId);
    }

    public async Task RemoveMemberAsync(string groupId, string targetUserId, string requestingUserId)
    {
        var group = await groupRepository.GetByIdAsync(groupId);
        
        if (group == null)
        {
            throw new KeyNotFoundException($"Group {groupId} not found");
        }

        // Check if requesting user is admin
        var requestingMember = group.Members.FirstOrDefault(m => m.UserId == requestingUserId);
        if (requestingMember?.Role != GroupRole.Admin)
        {
            throw new UnauthorizedAccessException("Only admins can remove members");
        }

        // Find target member
        var targetMember = group.Members.FirstOrDefault(m => m.UserId == targetUserId);
        if (targetMember == null)
        {
            throw new KeyNotFoundException($"Member {targetUserId} not found in group {groupId}");
        }

        // Last-admin protection: cannot remove the last admin
        if (targetMember.Role == GroupRole.Admin)
        {
            var adminCount = group.Members.Count(m => m.Role == GroupRole.Admin);
            if (adminCount == 1)
            {
                throw new InvalidOperationException("Cannot remove the last admin. Promote another member first.");
            }
        }

        // Remove member
        group.Members.Remove(targetMember);
        await groupRepository.UpdateAsync(group);

        logger.LogInformation("User {TargetUserId} removed from group {GroupId} by {RequestingUserId}", 
            targetUserId, groupId, requestingUserId);
    }

    private async Task PopulateMemberDetailsAsync(List<MemberDto> members)
    {
        foreach (var member in members)
        {
            var user = await userRepository.GetByIdAsync(member.UserId);
            if (user != null)
            {
                member.FirstName = user.FirstName;
                member.LastName = user.LastName;
                member.Email = user.Email;
            }
        }
    }

        public async Task<List<MemberDto>> GetGroupMembersAsync(string groupId, string userId)
        {
            var group = await groupRepository.GetByIdAsync(groupId);
        
            if (group == null)
            {
                throw new KeyNotFoundException($"Group {groupId} not found");
            }

            // Check if user is a member
            var isMember = group.Members.Any(m => m.UserId == userId);
            if (!isMember)
            {
                throw new UnauthorizedAccessException("You are not a member of this group");
            }

            // Map to DTOs
            var memberDtos = group.Members.Select(m => new MemberDto
            {
                UserId = m.UserId,
                Role = m.Role.ToString(),
                JoinedAt = m.JoinedAt,
                FirstName = string.Empty,
                LastName = string.Empty,
                Email = string.Empty
            }).ToList();

            // Hydrate member details (batch lookup)
            await PopulateMemberDetailsAsync(memberDtos);

            // Sort by role (Admin first) then joinedAt
            return memberDtos
                .OrderByDescending(m => m.Role == "Admin")
                .ThenBy(m => m.JoinedAt)
                .ToList();
        }
}
