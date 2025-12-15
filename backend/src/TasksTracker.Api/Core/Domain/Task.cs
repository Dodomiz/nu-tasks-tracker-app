using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TasksTracker.Api.Core.Domain;

public class TaskItem
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonRepresentation(BsonType.ObjectId)]
    public string GroupId { get; set; } = null!;

    [BsonRepresentation(BsonType.ObjectId)]
    public string? TemplateId { get; set; }

    [BsonRepresentation(BsonType.ObjectId)]
    public string AssignedUserId { get; set; } = null!;

    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int Difficulty { get; set; }

    public TaskStatus Status { get; set; } = TaskStatus.Pending;

    public DateTime DueAt { get; set; }
    public TaskFrequency Frequency { get; set; } = TaskFrequency.OneTime;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string CreatedByUserId { get; set; } = null!;
}

public enum TaskStatus
{
    Pending,
    InProgress,
    Completed,
    Overdue
}