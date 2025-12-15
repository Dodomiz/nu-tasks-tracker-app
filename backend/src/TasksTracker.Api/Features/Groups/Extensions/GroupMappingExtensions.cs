using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Features.Groups.Models;

namespace TasksTracker.Api.Features.Groups.Extensions;

public static class GroupMappingExtensions
{
    public static GroupResponse ToGroupResponse(this Group group, string userId)
    {
        var member = group.Members.FirstOrDefault(m => m.UserId == userId);
        var isAdmin = member?.Role == GroupRole.Admin;

        return new GroupResponse
        {
            Id = group.Id,
            Name = group.Name,
            Description = group.Description,
            AvatarUrl = group.AvatarUrl,
            Timezone = group.Timezone,
            Language = group.Language,
            InvitationCode = isAdmin ? group.InvitationCode : null,
            MemberCount = group.Members.Count,
            Members = isAdmin ? group.Members.Select(m => m.ToMemberDto()).ToList() : null,
            MyRole = member?.Role ?? string.Empty,
            CreatedAt = group.CreatedAt
        };
    }

    public static MemberDto ToMemberDto(this GroupMember member)
    {
        return new MemberDto
        {
            UserId = member.UserId,
            FirstName = string.Empty, // Will be populated from User lookup
            LastName = string.Empty,
            Email = string.Empty,
            Role = member.Role,
            JoinedAt = member.JoinedAt
        };
    }

    public static Group ToGroup(this CreateGroupRequest request, string userId, string invitationCode)
    {
        return new Group
        {
            Name = request.Name,
            Description = request.Description,
            AvatarUrl = request.AvatarUrl,
            Timezone = request.Timezone,
            Language = request.Language,
            InvitationCode = invitationCode,
            CreatedBy = userId,
            Members = new List<GroupMember>
            {
                new GroupMember
                {
                    UserId = userId,
                    Role = GroupRole.Admin,
                    JoinedAt = DateTime.UtcNow
                }
            },
            Settings = new GroupSettings
            {
                MaxMembers = 20,
                RequireApproval = false
            },
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            SchemaVersion = 1
        };
    }

    public static void UpdateFrom(this Group group, UpdateGroupRequest request)
    {
        group.Name = request.Name;
        group.Description = request.Description;
        group.AvatarUrl = request.AvatarUrl;
        group.Timezone = request.Timezone;
        group.Language = request.Language;
        group.UpdatedAt = DateTime.UtcNow;
    }
}
