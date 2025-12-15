using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Features.Categories.Models;

namespace TasksTracker.Api.Features.Categories.Extensions;

public static class CategoryExtensions
{
    public static CategoryResponse ToResponse(this Category category, int taskCount = 0)
        => new()
        {
            Id = category.Id,
            GroupId = category.GroupId,
            Name = category.Name,
            Icon = category.Icon,
            Color = category.Color,
            IsSystemCategory = category.IsSystemCategory,
            TaskCount = taskCount,
            CreatedAt = category.CreatedAt
        };
}
