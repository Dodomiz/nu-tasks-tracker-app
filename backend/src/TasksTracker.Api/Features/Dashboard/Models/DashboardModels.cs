using TasksTracker.Api.Core.Domain;

namespace TasksTracker.Api.Features.Dashboard.Models;

public class MemberSummaryDto
{
    public required string UserId { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public string? AvatarUrl { get; set; }
    public required string Role { get; set; } // Admin | Member
    public DateTime JoinedAt { get; set; }
}

public class GroupCardDto
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public int MemberCount { get; set; }
    public int TaskCount { get; set; }
    public DateTime LastActivity { get; set; }
    public List<MemberSummaryDto> Admins { get; set; } = [];
    public List<MemberSummaryDto> RecentMembers { get; set; } = [];
    public required string MyRole { get; set; } // Admin | Member
}

public class DashboardResponse
{
    public List<GroupCardDto> Groups { get; set; } = [];
    public long Total { get; set; }
    public int CurrentPage { get; set; }
    public int PageSize { get; set; }
    public bool HasMore { get; set; }
}
