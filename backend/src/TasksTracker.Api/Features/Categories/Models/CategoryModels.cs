using System.ComponentModel.DataAnnotations;

namespace TasksTracker.Api.Features.Categories.Models;

public class CreateCategoryRequest
{
    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Icon { get; set; } = string.Empty; // Heroicon name

    [Required]
    [RegularExpression(@"^[a-z]+-\d{3}$")]
    public string Color { get; set; } = "blue-500"; // Tailwind color
}

public class UpdateCategoryRequest
{
    [StringLength(50, MinimumLength = 2)]
    public string? Name { get; set; }

    public string? Icon { get; set; }

    [RegularExpression(@"^[a-z]+-\d{3}$")]
    public string? Color { get; set; }
}

public class CategoryResponse
{
    public string Id { get; set; } = string.Empty;
    public string GroupId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public bool IsSystemCategory { get; set; }
    public int TaskCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
