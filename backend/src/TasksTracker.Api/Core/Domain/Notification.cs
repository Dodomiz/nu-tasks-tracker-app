using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TasksTracker.Api.Core.Domain;

public class Notification
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = null!;

    public NotificationType Type { get; set; }

    public NotificationContent Content { get; set; } = null!;

    public bool IsRead { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class NotificationContent
{
    public string Title { get; set; } = null!;
    public string Body { get; set; } = null!;
    public Dictionary<string, object>? Metadata { get; set; }
}

public enum NotificationType
{
    TASK_ASSIGNED = 0,
    TASK_STATUS_CHANGED = 1,
    TASK_PENDING_APPROVAL = 2,
    GROUP_MEMBER_JOINED = 3,
    GROUP_MEMBER_REMOVED = 4,
    GROUP_INVITATION_RECEIVED = 5
}
