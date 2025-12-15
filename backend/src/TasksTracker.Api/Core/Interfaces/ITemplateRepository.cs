using TasksTracker.Api.Core.Domain;

namespace TasksTracker.Api.Core.Interfaces;

/// <summary>
/// Repository interface for TaskTemplate operations
/// </summary>
public interface ITemplateRepository : IRepository<TaskTemplate>
{
    /// <summary>
    /// Get all templates accessible to a group (system templates + group-specific templates)
    /// </summary>
    /// <param name="groupId">Group ID</param>
    /// <param name="categoryId">Optional category filter</param>
    /// <param name="difficultyMin">Optional minimum difficulty filter</param>
    /// <param name="difficultyMax">Optional maximum difficulty filter</param>
    /// <param name="frequency">Optional frequency filter</param>
    /// <returns>List of templates excluding soft-deleted</returns>
    Task<List<TaskTemplate>> GetTemplatesForGroupAsync(
        string groupId,
        string? categoryId = null,
        int? difficultyMin = null,
        int? difficultyMax = null,
        TaskFrequency? frequency = null);

    /// <summary>
    /// Get template by ID with soft-delete check
    /// </summary>
    /// <param name="id">Template ID</param>
    /// <returns>Template or null if not found or deleted</returns>
    Task<TaskTemplate?> GetByIdWithDeleteCheckAsync(string id);

    /// <summary>
    /// Update existing template
    /// </summary>
    /// <param name="template">Template to update</param>
    /// <returns>Updated template</returns>
    Task<TaskTemplate> UpdateAsync(TaskTemplate template);

    /// <summary>
    /// Soft delete template
    /// </summary>
    /// <param name="id">Template ID</param>
    /// <returns>True if deleted successfully</returns>
    Task<bool> SoftDeleteAsync(string id);

    /// <summary>
    /// Check if template name exists in group (for duplicate validation)
    /// </summary>
    /// <param name="groupId">Group ID</param>
    /// <param name="name">Template name</param>
    /// <param name="excludeId">Template ID to exclude from check (for updates)</param>
    /// <returns>True if name exists</returns>
    Task<bool> NameExistsInGroupAsync(string groupId, string name, string? excludeId = null);

    /// <summary>
    /// Ensure indexes exist on the collection
    /// </summary>
    /// <returns>True if successful</returns>
    Task<bool> EnsureIndexesAsync();
}
