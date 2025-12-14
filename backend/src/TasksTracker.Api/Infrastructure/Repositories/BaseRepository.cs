using MongoDB.Driver;
using TasksTracker.Api.Core.Interfaces;
using TasksTracker.Api.Infrastructure.Data;

namespace TasksTracker.Api.Infrastructure.Repositories;

public class BaseRepository<T>(MongoDbContext context, string collectionName) : IRepository<T> where T : class
{
    protected readonly IMongoCollection<T> _collection = context.GetCollection<T>(collectionName);

    public virtual async Task<T?> GetByIdAsync(string id)
    {
        var filter = Builders<T>.Filter.Eq("_id", id);
        return await _collection.Find(filter).FirstOrDefaultAsync();
    }

    public virtual async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _collection.Find(_ => true).ToListAsync();
    }

    public virtual async Task<T> CreateAsync(T entity)
    {
        await _collection.InsertOneAsync(entity);
        return entity;
    }

    public virtual async Task<bool> UpdateAsync(string id, T entity)
    {
        var filter = Builders<T>.Filter.Eq("_id", id);
        var result = await _collection.ReplaceOneAsync(filter, entity);
        return result.ModifiedCount > 0;
    }

    public virtual async Task<bool> DeleteAsync(string id)
    {
        var filter = Builders<T>.Filter.Eq("_id", id);
        var result = await _collection.DeleteOneAsync(filter);
        return result.DeletedCount > 0;
    }
}
