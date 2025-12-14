using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TasksTracker.Api.Core.Domain;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;
    
    [BsonElement("email")]
    public string Email { get; set; } = string.Empty;
    
    [BsonElement("passwordHash")]
    public string PasswordHash { get; set; } = string.Empty;
    
    [BsonElement("firstName")]
    public string FirstName { get; set; } = string.Empty;
    
    [BsonElement("lastName")]
    public string LastName { get; set; } = string.Empty;
    
    [BsonElement("profilePhotoUrl")]
    public string? ProfilePhotoUrl { get; set; }
    
    [BsonElement("language")]
    public string Language { get; set; } = "en";
    
    [BsonElement("isEmailVerified")]
    public bool IsEmailVerified { get; set; }
    
    [BsonElement("emailVerificationToken")]
    public string? EmailVerificationToken { get; set; }
    
    [BsonElement("emailVerificationExpiry")]
    public DateTime? EmailVerificationExpiry { get; set; }
    
    [BsonElement("passwordResetToken")]
    public string? PasswordResetToken { get; set; }
    
    [BsonElement("passwordResetExpiry")]
    public DateTime? PasswordResetExpiry { get; set; }
    
    [BsonElement("failedLoginAttempts")]
    public int FailedLoginAttempts { get; set; }
    
    [BsonElement("lockoutUntil")]
    public DateTime? LockoutUntil { get; set; }
    
    [BsonElement("refreshToken")]
    public string? RefreshToken { get; set; }
    
    [BsonElement("refreshTokenExpiry")]
    public DateTime? RefreshTokenExpiry { get; set; }
    
    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    [BsonElement("lastLoginAt")]
    public DateTime? LastLoginAt { get; set; }
}
