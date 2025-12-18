using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TasksTracker.Api.Core.Domain;

/// <summary>
/// Code-based invitation entity for FR-026
/// Allows admins to generate shareable invitation codes with optional email restrictions
/// </summary>
public class CodeInvite
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("groupId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string GroupId { get; set; } = string.Empty;

    [BsonElement("code")]
    public string Code { get; set; } = string.Empty;

    [BsonElement("email")]
    public string? Email { get; set; }

    [BsonElement("invitedBy")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string InvitedBy { get; set; } = string.Empty;

    [BsonElement("status")]
    public CodeInviteStatus Status { get; set; } = CodeInviteStatus.Pending;

    [BsonElement("usedBy")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? UsedBy { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("usedAt")]
    public DateTime? UsedAt { get; set; }
}

public enum CodeInviteStatus
{
    Pending,
    Approved
}
