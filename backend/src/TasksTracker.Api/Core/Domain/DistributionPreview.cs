using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TasksTracker.Api.Core.Domain;

/// <summary>
/// Represents a distribution preview stored temporarily
/// </summary>
public class DistributionPreviewEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    public required string GroupId { get; set; }
    public required string Status { get; set; } // "Pending", "Processing", "Completed", "Failed"
    public required string Method { get; set; } // "AI" or "Rule-Based"
    
    public List<AssignmentRecord> Assignments { get; set; } = [];
    
    public int TotalTasks { get; set; }
    public int TotalUsers { get; set; }
    public double WorkloadVariance { get; set; }
    public Dictionary<string, int> TasksPerUser { get; set; } = [];
    
    public string? Error { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddHours(24);
}

/// <summary>
/// Individual assignment record in a preview
/// </summary>
public class AssignmentRecord
{
    public required string TaskId { get; set; }
    public required string TaskName { get; set; }
    public required string AssignedUserId { get; set; }
    public required string AssignedUserName { get; set; }
    public double Confidence { get; set; }
    public string? Rationale { get; set; }
}
