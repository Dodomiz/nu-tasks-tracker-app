using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Features.Templates.Models;

namespace TasksTracker.Api.Features.Templates.Extensions;

public static class TemplateExtensions
{
    /// <summary>
    /// Convert TaskTemplate domain model to TemplateResponse DTO
    /// </summary>
    public static TemplateResponse ToResponse(this TaskTemplate template)
    {
        return new TemplateResponse
        {
            Id = template.Id,
            Name = template.Name,
            Description = template.Description,
            CategoryId = template.CategoryId,
            DifficultyLevel = template.DifficultyLevel,
            EstimatedDurationMinutes = template.EstimatedDurationMinutes,
            DefaultFrequency = template.DefaultFrequency,
            IsSystemTemplate = template.IsSystemTemplate,
            GroupId = template.GroupId,
            CreatedAt = template.CreatedAt,
            UpdatedAt = template.UpdatedAt,
            CreatedBy = template.CreatedBy
        };
    }

    /// <summary>
    /// Convert CreateTemplateRequest to TaskTemplate domain model
    /// </summary>
    public static TaskTemplate ToEntity(this CreateTemplateRequest request, string groupId, string userId)
    {
        return new TaskTemplate
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            CategoryId = request.CategoryId,
            DifficultyLevel = request.DifficultyLevel,
            EstimatedDurationMinutes = request.EstimatedDurationMinutes,
            DefaultFrequency = request.DefaultFrequency,
            IsSystemTemplate = false,
            GroupId = groupId,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };
    }
}
