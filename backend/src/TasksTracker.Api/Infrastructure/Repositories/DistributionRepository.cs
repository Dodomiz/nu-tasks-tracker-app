using MongoDB.Driver;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Core.Interfaces;

namespace TasksTracker.Api.Infrastructure.Repositories;

/// <summary>
/// MongoDB repository for distribution previews
/// </summary>
public class DistributionRepository(IMongoDatabase database) : IDistributionRepository
{
    private readonly IMongoCollection<DistributionPreviewEntity> _previews =
        database.GetCollection<DistributionPreviewEntity>("distributionPreviews");

    public async Task<string> CreateAsync(DistributionPreviewEntity preview)
    {
        await _previews.InsertOneAsync(preview);
        return preview.Id;
    }

    public async Task<DistributionPreviewEntity?> GetByIdAsync(string id)
    {
        return await _previews.Find(p => p.Id == id).FirstOrDefaultAsync();
    }

    public async Task UpdateAsync(DistributionPreviewEntity preview)
    {
        await _previews.ReplaceOneAsync(p => p.Id == preview.Id, preview);
    }

    public async Task DeleteExpiredAsync()
    {
        var now = DateTime.UtcNow;
        await _previews.DeleteManyAsync(p => p.ExpiresAt < now);
    }
}
