using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TasksTracker.Api.Core.Domain;

public class Category
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("groupId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string GroupId { get; set; } = string.Empty;

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("icon")]
    public string Icon { get; set; } = string.Empty; // Heroicon name

    [BsonElement("color")]
    public string Color { get; set; } = "blue-500"; // Tailwind color

    [BsonElement("isSystemCategory")]
    public bool IsSystemCategory { get; set; } = false;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("createdBy")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string CreatedBy { get; set; } = string.Empty;

    [BsonElement("schemaVersion")]
    public int SchemaVersion { get; set; } = 1;
}
