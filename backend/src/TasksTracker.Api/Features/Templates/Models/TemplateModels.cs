using System.ComponentModel.DataAnnotations;
using TasksTracker.Api.Core.Domain;

namespace TasksTracker.Api.Features.Templates.Models;

public class CreateTemplateRequest
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    public string? CategoryId { get; set; }

    [Required]
    [Range(1, 10)]
    public int DifficultyLevel { get; set; } = 1;

    public int? EstimatedDurationMinutes { get; set; }

    [Required]
    public TaskFrequency DefaultFrequency { get; set; } = TaskFrequency.OneTime;
}

public class UpdateTemplateRequest
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    public string? CategoryId { get; set; }

    [Required]
    [Range(1, 10)]
    public int DifficultyLevel { get; set; } = 1;

    public int? EstimatedDurationMinutes { get; set; }

    [Required]
    public TaskFrequency DefaultFrequency { get; set; } = TaskFrequency.OneTime;
}

public class TemplateResponse
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CategoryId { get; set; }
    public int DifficultyLevel { get; set; }
    public int? EstimatedDurationMinutes { get; set; }
    public TaskFrequency DefaultFrequency { get; set; }
    public bool IsSystemTemplate { get; set; }
    public string? GroupId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
}

public class GetTemplatesQuery
{
    public string? CategoryId { get; set; }
    public int? DifficultyMin { get; set; }
    public int? DifficultyMax { get; set; }
    public TaskFrequency? Frequency { get; set; }
}
