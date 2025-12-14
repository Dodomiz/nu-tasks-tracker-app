using MongoDB.Driver;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Core.Interfaces;
using TasksTracker.Api.Infrastructure.Data;

namespace TasksTracker.Api.Infrastructure.Repositories;

public class UserRepository(MongoDbContext context) : BaseRepository<User>(context, "users"), IUserRepository
{
    public async Task<User?> GetByEmailAsync(string email)
    {
        var filter = Builders<User>.Filter.Eq(u => u.Email, email);
        return await _collection.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<User?> GetByRefreshTokenAsync(string refreshToken)
    {
        var filter = Builders<User>.Filter.Eq(u => u.RefreshToken, refreshToken);
        return await _collection.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<User?> GetByEmailVerificationTokenAsync(string token)
    {
        var filter = Builders<User>.Filter.Eq(u => u.EmailVerificationToken, token);
        return await _collection.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<User?> GetByPasswordResetTokenAsync(string token)
    {
        var filter = Builders<User>.Filter.Eq(u => u.PasswordResetToken, token);
        return await _collection.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        var filter = Builders<User>.Filter.Eq(u => u.Email, email);
        var count = await _collection.CountDocumentsAsync(filter);
        return count > 0;
    }
}
