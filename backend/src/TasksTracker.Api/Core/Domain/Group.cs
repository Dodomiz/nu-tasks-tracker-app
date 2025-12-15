using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TasksTracker.Api.Core.Domain;

public class Group
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;
    
    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;
    
    [BsonElement("description")]
    public string? Description { get; set; }
    
    [BsonElement("avatarUrl")]
    public string? AvatarUrl { get; set; }
    
    [BsonElement("timezone")]
    public string Timezone { get; set; } = "UTC";
    
    [BsonElement("language")]
    public string Language { get; set; } = "en";
    
    [BsonElement("invitationCode")]
    public string InvitationCode { get; set; } = string.Empty;
    
    [BsonElement("createdBy")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string CreatedBy { get; set; } = string.Empty;
    
    [BsonElement("members")]
    public List<GroupMember> Members { get; set; } = new();
    
    [BsonElement("settings")]
    public GroupSettings Settings { get; set; } = new();
    
    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    [BsonElement("schemaVersion")]
    public int SchemaVersion { get; set; } = 1;
}

public class GroupMember
{
    [BsonElement("userId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = string.Empty;
    
    [BsonElement("role")]
    public string Role { get; set; } = "RegularUser"; // Admin or RegularUser
    
    [BsonElement("joinedAt")]
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    
    [BsonElement("invitedBy")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? InvitedBy { get; set; }
}

public class GroupSettings
{
    [BsonElement("maxMembers")]
    public int MaxMembers { get; set; } = 20;
    
    [BsonElement("requireApproval")]
    public bool RequireApproval { get; set; }
}

public static class GroupRole
{
    public const string Admin = "Admin";
    public const string RegularUser = "RegularUser";
}
