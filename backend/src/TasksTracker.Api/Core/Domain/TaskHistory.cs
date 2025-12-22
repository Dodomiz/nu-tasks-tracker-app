using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TasksTracker.Api.Core.Domain;

public class TaskHistory
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonRepresentation(BsonType.ObjectId)]
    public string TaskId { get; set; } = null!;

    [BsonRepresentation(BsonType.ObjectId)]
    public string GroupId { get; set; } = null!;

    [BsonRepresentation(BsonType.ObjectId)]
    public string ChangedByUserId { get; set; } = null!;

    public TaskHistoryAction Action { get; set; }

    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

    public Dictionary<string, string> Changes { get; set; } = new();

    public string? Notes { get; set; }
}

public enum TaskHistoryAction
{
    Created,
    Updated,
    StatusChanged,
    Reassigned,
    Deleted,
    CompletionApproved,
    CompletionRejected
}
