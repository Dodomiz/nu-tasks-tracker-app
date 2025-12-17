namespace TasksTracker.Api.Features.Dashboard.DTOs;

public class DashboardResponse
{
    public List<GroupCardDto> Groups { get; set; } = new();
    public int Total { get; set; }
    public int CurrentPage { get; set; }
    public int PageSize { get; set; }
    public bool HasMore { get; set; }
}

public class GroupCardDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int MemberCount { get; set; }
    public int TaskCount { get; set; }
    public DateTime LastActivity { get; set; }
    public List<MemberSummaryDto> Admins { get; set; } = new();
    public List<MemberSummaryDto> RecentMembers { get; set; } = new();
    public string MyRole { get; set; } = string.Empty;
}

public class MemberSummaryDto
{
    public string UserId { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string Role { get; set; } = string.Empty;
    public DateTime JoinedAt { get; set; }
}
