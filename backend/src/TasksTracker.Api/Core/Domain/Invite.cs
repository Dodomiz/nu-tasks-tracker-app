using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TasksTracker.Api.Core.Domain;

public class Invite
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("groupId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string GroupId { get; set; } = string.Empty;

    [BsonElement("email")]
    public string Email { get; set; } = string.Empty;

    [BsonElement("status")]
    public InviteStatus Status { get; set; } = InviteStatus.Pending;

    [BsonElement("token")]
    public string Token { get; set; } = string.Empty;

    [BsonElement("invitedBy")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string InvitedBy { get; set; } = string.Empty;

    [BsonElement("invitedAt")]
    public DateTime InvitedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("respondedAt")]
    public DateTime? RespondedAt { get; set; }

    [BsonElement("lastSentAt")]
    public DateTime? LastSentAt { get; set; }

    [BsonElement("sendCount")]
    public int SendCount { get; set; } = 1;

    [BsonElement("notes")]
    public string? Notes { get; set; }
}

public enum InviteStatus
{
    Pending,
    Joined,
    Declined,
    Canceled,
    Expired
}
