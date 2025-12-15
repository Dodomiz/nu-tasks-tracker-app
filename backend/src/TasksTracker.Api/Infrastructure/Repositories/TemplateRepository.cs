using MongoDB.Bson;
using MongoDB.Driver;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Core.Interfaces;
using TasksTracker.Api.Infrastructure.Data;
using System.Text.RegularExpressions;

namespace TasksTracker.Api.Infrastructure.Repositories;

/// <summary>
/// Repository for TaskTemplate CRUD operations
/// </summary>
public class TemplateRepository(MongoDbContext context) 
    : BaseRepository<TaskTemplate>(context, "taskLibrary"), ITemplateRepository
{
    public async Task<List<TaskTemplate>> GetTemplatesForGroupAsync(
        string groupId,
        string? categoryId = null,
        int? difficultyMin = null,
        int? difficultyMax = null,
        TaskFrequency? frequency = null)
    {
        var filterBuilder = Builders<TaskTemplate>.Filter;
        
        // Base filter: not deleted AND (system templates OR group-specific templates)
        var filter = filterBuilder.And(
            filterBuilder.Eq(t => t.IsDeleted, false),
            filterBuilder.Or(
                filterBuilder.Eq(t => t.IsSystemTemplate, true),
                filterBuilder.Eq(t => t.GroupId, groupId)
            )
        );

        // Apply optional filters
        if (!string.IsNullOrWhiteSpace(categoryId))
        {
            filter = filterBuilder.And(filter, filterBuilder.Eq(t => t.CategoryId, categoryId));
        }

        if (difficultyMin.HasValue)
        {
            filter = filterBuilder.And(filter, filterBuilder.Gte(t => t.DifficultyLevel, difficultyMin.Value));
        }

        if (difficultyMax.HasValue)
        {
            filter = filterBuilder.And(filter, filterBuilder.Lte(t => t.DifficultyLevel, difficultyMax.Value));
        }

        if (frequency.HasValue)
        {
            filter = filterBuilder.And(filter, filterBuilder.Eq(t => t.DefaultFrequency, frequency.Value));
        }

        return await _collection.Find(filter)
            .SortBy(t => t.IsSystemTemplate)
            .ThenBy(t => t.Name)
            .ToListAsync();
    }

    public async Task<TaskTemplate?> GetByIdWithDeleteCheckAsync(string id)
    {
        var filter = Builders<TaskTemplate>.Filter.And(
            Builders<TaskTemplate>.Filter.Eq(t => t.Id, id),
            Builders<TaskTemplate>.Filter.Eq(t => t.IsDeleted, false)
        );

        return await _collection.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<TaskTemplate> UpdateAsync(TaskTemplate template)
    {
        template.UpdatedAt = DateTime.UtcNow;
        var filter = Builders<TaskTemplate>.Filter.Eq(t => t.Id, template.Id);
        await _collection.ReplaceOneAsync(filter, template);
        return template;
    }

    public async Task<bool> SoftDeleteAsync(string id)
    {
        var update = Builders<TaskTemplate>.Update
            .Set(t => t.IsDeleted, true)
            .Set(t => t.DeletedAt, DateTime.UtcNow);

        var filter = Builders<TaskTemplate>.Filter.Eq(t => t.Id, id);
        var result = await _collection.UpdateOneAsync(filter, update);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> NameExistsInGroupAsync(string groupId, string name, string? excludeId = null)
    {
        var filterBuilder = Builders<TaskTemplate>.Filter;
        
        var filter = filterBuilder.And(
            filterBuilder.Eq(t => t.GroupId, groupId),
            filterBuilder.Eq(t => t.IsDeleted, false),
            filterBuilder.Regex(t => t.Name, new BsonRegularExpression($"^{RegexEscape(name)}$", "i"))
        );

        if (!string.IsNullOrWhiteSpace(excludeId))
        {
            filter = filterBuilder.And(filter, filterBuilder.Ne(t => t.Id, excludeId));
        }

        var count = await _collection.CountDocumentsAsync(filter);
        return count > 0;
    }

    public async Task<bool> EnsureIndexesAsync()
    {
        try
        {
            // Compound index for filtering: (GroupId, IsSystemTemplate, IsDeleted)
            var groupSystemDeletedIndex = new CreateIndexModel<TaskTemplate>(
                Builders<TaskTemplate>.IndexKeys
                    .Ascending(t => t.GroupId)
                    .Ascending(t => t.IsSystemTemplate)
                    .Ascending(t => t.IsDeleted)
            );

            // Index for category filtering
            var categoryIndex = new CreateIndexModel<TaskTemplate>(
                Builders<TaskTemplate>.IndexKeys
                    .Ascending(t => t.CategoryId)
                    .Ascending(t => t.IsDeleted)
            );

            // Index for difficulty filtering
            var difficultyIndex = new CreateIndexModel<TaskTemplate>(
                Builders<TaskTemplate>.IndexKeys
                    .Ascending(t => t.DifficultyLevel)
                    .Ascending(t => t.IsDeleted)
            );

            // Index for name search (for duplicate checking)
            var nameIndex = new CreateIndexModel<TaskTemplate>(
                Builders<TaskTemplate>.IndexKeys
                    .Ascending(t => t.Name)
            );

            await _collection.Indexes.CreateManyAsync(new[] 
            { 
                groupSystemDeletedIndex, 
                categoryIndex, 
                difficultyIndex,
                nameIndex
            });

            return true;
        }
        catch
        {
            return false;
        }
    }

    private static string RegexEscape(string input) => Regex.Escape(input);
}
