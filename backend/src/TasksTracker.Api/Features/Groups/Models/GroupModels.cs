using System.ComponentModel.DataAnnotations;

namespace TasksTracker.Api.Features.Groups.Models;

public class CreateGroupRequest
{
    [Required]
    [StringLength(50, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    public string? AvatarUrl { get; set; }
    
    [Required]
    [StringLength(30, MinimumLength = 1)]
    public string Category { get; set; } = "home";
}

public class UpdateGroupRequest
{
    [Required]
    [StringLength(50, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    public string? AvatarUrl { get; set; }
    
    [Required]
    [StringLength(30, MinimumLength = 1)]
    public string Category { get; set; } = "home";
}

public class InviteMemberRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}

public class GroupResponse
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? AvatarUrl { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? InvitationCode { get; set; } // Only visible to Admins
    public int MemberCount { get; set; }
    public List<MemberDto>? Members { get; set; } // Full list only for Admins
    public string MyRole { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class MemberDto
{
    public string UserId { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime JoinedAt { get; set; }
}

public class InviteResponse
{
    public string Message { get; set; } = string.Empty;
    public string InvitationUrl { get; set; } = string.Empty;
}

public class InviteDto
{
    public string Id { get; set; } = string.Empty;
    public string GroupId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string InvitedBy { get; set; } = string.Empty;
    public string InvitedByName { get; set; } = string.Empty;
    public DateTime InvitedAt { get; set; }
    public DateTime? RespondedAt { get; set; }
    public int SendCount { get; set; }
}

public class GroupsResponse
{
    public List<GroupResponse> Groups { get; set; } = new();
    public int Total { get; set; }
}
