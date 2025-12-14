using MongoDB.Driver;

namespace TasksTracker.Api.Infrastructure.Data;

public class MongoDbContext(IMongoDatabase database)
{
    public IMongoDatabase Database { get; } = database;

    // Collections
    public IMongoCollection<TDocument> GetCollection<TDocument>(string name) 
        => Database.GetCollection<TDocument>(name);
}
