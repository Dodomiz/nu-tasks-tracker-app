using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace TasksTracker.Api.Core.Domain;

/// <summary>
/// Task template entity for reusable task definitions
/// </summary>
public class TaskTemplate
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Template name (required, max 100 characters)
    /// </summary>
    [BsonElement("name")]
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Optional description (max 500 characters)
    /// </summary>
    [BsonElement("description")]
    [StringLength(500)]
    public string? Description { get; set; }

    /// <summary>
    /// Optional reference to Category
    /// </summary>
    [BsonElement("categoryId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? CategoryId { get; set; }

    /// <summary>
    /// Task difficulty level (1-10 scale)
    /// </summary>
    [BsonElement("difficultyLevel")]
    [Range(1, 10)]
    public int DifficultyLevel { get; set; } = 1;

    /// <summary>
    /// Estimated duration in minutes
    /// </summary>
    [BsonElement("estimatedDurationMinutes")]
    public int? EstimatedDurationMinutes { get; set; }

    /// <summary>
    /// Default frequency for tasks created from this template
    /// </summary>
    [BsonElement("defaultFrequency")]
    public TaskFrequency DefaultFrequency { get; set; } = TaskFrequency.OneTime;

    /// <summary>
    /// True if this is a system template (global, read-only)
    /// False if group-specific (editable by admins)
    /// </summary>
    [BsonElement("isSystemTemplate")]
    public bool IsSystemTemplate { get; set; } = false;

    /// <summary>
    /// Group ID for group-specific templates (null if IsSystemTemplate=true)
    /// </summary>
    [BsonElement("groupId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? GroupId { get; set; }

    /// <summary>
    /// Template creation timestamp
    /// </summary>
    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Last update timestamp
    /// </summary>
    [BsonElement("updatedAt")]
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// User ID who created this template
    /// </summary>
    [BsonElement("createdBy")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string CreatedBy { get; set; } = string.Empty;

    /// <summary>
    /// Soft delete flag
    /// </summary>
    [BsonElement("isDeleted")]
    public bool IsDeleted { get; set; } = false;

    /// <summary>
    /// Soft delete timestamp
    /// </summary>
    [BsonElement("deletedAt")]
    public DateTime? DeletedAt { get; set; }

    /// <summary>
    /// Schema version for future migrations
    /// </summary>
    [BsonElement("schemaVersion")]
    public int SchemaVersion { get; set; } = 1;
}

/// <summary>
/// Task frequency options
/// </summary>
public enum TaskFrequency
{
    OneTime,
    Daily,
    Weekly,
    BiWeekly,
    Monthly,
    Quarterly,
    Yearly
}
