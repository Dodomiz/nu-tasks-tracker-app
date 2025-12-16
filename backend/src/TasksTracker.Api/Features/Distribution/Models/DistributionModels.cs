namespace TasksTracker.Api.Features.Distribution.Models;

/// <summary>
/// Request to generate a task distribution
/// </summary>
public class GenerateDistributionRequest
{
    public required string GroupId { get; set; }
    public required DateTime StartDate { get; set; }
    public required DateTime EndDate { get; set; }
    public List<string>? UserIds { get; set; } // If null, use all group members
}

/// <summary>
/// Response containing the preview ID for polling
/// </summary>
public class GenerateDistributionResponse
{
    public required string PreviewId { get; set; }
    public required string Status { get; set; } // "Pending", "Processing", "Completed", "Failed"
}

/// <summary>
/// Response containing the distribution preview
/// </summary>
public class DistributionPreview
{
    public required string Id { get; set; }
    public required string Status { get; set; }
    public required string Method { get; set; } // "AI" or "Rule-Based"
    public List<AssignmentProposal> Assignments { get; set; } = [];
    public DistributionStats? Stats { get; set; }
    public string? Error { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Individual task assignment proposal
/// </summary>
public class AssignmentProposal
{
    public required string TaskId { get; set; }
    public required string TaskName { get; set; }
    public required string AssignedUserId { get; set; }
    public required string AssignedUserName { get; set; }
    public double Confidence { get; set; } // 0.0 to 1.0
    public string? Rationale { get; set; }
}

/// <summary>
/// Statistics about the distribution
/// </summary>
public class DistributionStats
{
    public int TotalTasks { get; set; }
    public int TotalUsers { get; set; }
    public double WorkloadVariance { get; set; } // Percentage
    public Dictionary<string, int> TasksPerUser { get; set; } = [];
}

/// <summary>
/// Request to apply a distribution (with optional modifications)
/// </summary>
public class ApplyDistributionRequest
{
    public List<AssignmentModification>? Modifications { get; set; }
}

/// <summary>
/// Modification to a proposed assignment
/// </summary>
public class AssignmentModification
{
    public required string TaskId { get; set; }
    public required string NewAssignedUserId { get; set; }
}

/// <summary>
/// Response after applying distribution
/// </summary>
public class ApplyDistributionResponse
{
    public int AssignedCount { get; set; }
    public int ModifiedCount { get; set; }
    public DistributionStats FinalStats { get; set; } = new();
}
