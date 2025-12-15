using TasksTracker.Api.Core.Domain;

namespace TasksTracker.Api.Core.Interfaces;

public interface ICategoryRepository
{
    Task<Category?> GetByIdAsync(string id);
    Task<List<Category>> GetByGroupAsync(string groupId);
    Task<Category> CreateAsync(Category category);
    Task<Category> UpdateAsync(Category category);
    Task<bool> DeleteAsync(string id);
    Task<bool> NameExistsInGroupAsync(string groupId, string name, string? excludeId = null);
    Task<long> GetTaskCountAsync(string categoryId);
    Task<bool> EnsureIndexesAsync();
}
