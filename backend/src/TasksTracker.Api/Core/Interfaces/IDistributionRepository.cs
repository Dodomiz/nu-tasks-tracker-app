using TasksTracker.Api.Core.Domain;

namespace TasksTracker.Api.Core.Interfaces;

/// <summary>
/// Repository for distribution preview operations
/// </summary>
public interface IDistributionRepository
{
    Task<string> CreateAsync(DistributionPreviewEntity preview);
    Task<DistributionPreviewEntity?> GetByIdAsync(string id);
    Task UpdateAsync(DistributionPreviewEntity preview);
    Task DeleteExpiredAsync();
}
