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
}
