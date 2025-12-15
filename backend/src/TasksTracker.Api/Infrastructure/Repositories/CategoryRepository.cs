using MongoDB.Bson;
using MongoDB.Driver;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Core.Interfaces;
using TasksTracker.Api.Infrastructure.Data;
using System.Text.RegularExpressions;

namespace TasksTracker.Api.Infrastructure.Repositories;

public class CategoryRepository(MongoDbContext context) : BaseRepository<Category>(context, "categories"), ICategoryRepository
{
    public async Task<List<Category>> GetByGroupAsync(string groupId)
    {
        var filter = Builders<Category>.Filter.Eq(c => c.GroupId, groupId);
        return await _collection.Find(filter).ToListAsync();
    }

    public async Task<Category> UpdateAsync(Category category)
    {
        var filter = Builders<Category>.Filter.Eq(c => c.Id, category.Id);
        await _collection.ReplaceOneAsync(filter, category);
        return category;
    }

    public async Task<bool> NameExistsInGroupAsync(string groupId, string name, string? excludeId = null)
    {
        var filter = Builders<Category>.Filter.And(
            Builders<Category>.Filter.Eq(c => c.GroupId, groupId),
            Builders<Category>.Filter.Regex(c => c.Name, new BsonRegularExpression($"^{RegexEscape(name)}$", "i"))
        );

        if (!string.IsNullOrWhiteSpace(excludeId))
        {
            filter = Builders<Category>.Filter.And(
                filter,
                Builders<Category>.Filter.Ne(c => c.Id, excludeId)
            );
        }

        var count = await _collection.CountDocumentsAsync(filter);
        return count > 0;
    }

    public async Task<long> GetTaskCountAsync(string categoryId)
    {
        // Count tasks referencing this categoryId
        var tasksCollection = context.GetCollection<BsonDocument>("tasks");
        var filter = Builders<BsonDocument>.Filter.Eq("categoryId", categoryId);
        return await tasksCollection.CountDocumentsAsync(filter);
    }

    public async Task<bool> EnsureIndexesAsync()
    {
        try
        {
            // Unique compound index on (groupId, name)
            var uniqueNameIndex = new CreateIndexModel<Category>(
                Builders<Category>.IndexKeys.Ascending(c => c.GroupId).Ascending(c => c.Name),
                new CreateIndexOptions { Unique = true }
            );

            var groupCreatedAtIndex = new CreateIndexModel<Category>(
                Builders<Category>.IndexKeys.Ascending(c => c.GroupId).Ascending(c => c.CreatedAt)
            );

            await _collection.Indexes.CreateManyAsync(new[] { uniqueNameIndex, groupCreatedAtIndex });
            return true;
        }
        catch
        {
            return false;
        }
    }

    private static string RegexEscape(string input) => Regex.Escape(input);
}
