using TasksTracker.Api.Core.Domain;

namespace TasksTracker.Api.Core.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByRefreshTokenAsync(string refreshToken);
    Task<User?> GetByEmailVerificationTokenAsync(string token);
    Task<User?> GetByPasswordResetTokenAsync(string token);
    Task<bool> EmailExistsAsync(string email);
}
