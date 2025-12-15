using TasksTracker.Api.Features.Templates.Models;

namespace TasksTracker.Api.Features.Templates.Services;

/// <summary>
/// Service interface for template business logic
/// </summary>
public interface ITemplateService
{
    /// <summary>
    /// Get all templates accessible to a group with optional filters
    /// </summary>
    Task<List<TemplateResponse>> GetTemplatesAsync(string groupId, string userId, GetTemplatesQuery query);

    /// <summary>
    /// Get template by ID
    /// </summary>
    Task<TemplateResponse> GetTemplateByIdAsync(string groupId, string id, string userId);

    /// <summary>
    /// Create new group-specific template (admin only)
    /// </summary>
    Task<TemplateResponse> CreateTemplateAsync(string groupId, CreateTemplateRequest request, string userId);

    /// <summary>
    /// Update existing group-specific template (admin only, system templates read-only)
    /// </summary>
    Task<TemplateResponse> UpdateTemplateAsync(string groupId, string id, UpdateTemplateRequest request, string userId);

    /// <summary>
    /// Delete group-specific template (admin only, soft delete)
    /// </summary>
    Task DeleteTemplateAsync(string groupId, string id, string userId);
}
