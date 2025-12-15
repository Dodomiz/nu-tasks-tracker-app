using Microsoft.Extensions.Logging;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Core.Interfaces;
using TasksTracker.Api.Features.Categories.Extensions;
using TasksTracker.Api.Features.Categories.Models;

namespace TasksTracker.Api.Features.Categories.Services;

public class CategoryService(
    ICategoryRepository categoryRepository,
    IGroupRepository groupRepository,
    ILogger<CategoryService> logger) : ICategoryService
{
    private static readonly IReadOnlyList<(string Name, string Icon, string Color)> SystemCategories = new List<(string, string, string)>
    {
        ("House", "home", "orange-500"),
        ("Yard", "scissors", "green-600"),
        ("Pets", "paw", "amber-500"),
        ("Studies", "academic-cap", "purple-600"),
        ("Work", "briefcase", "blue-600"),
        ("Vehicle", "truck", "gray-700"),
        ("Finance", "currency-dollar", "emerald-600"),
        ("Shopping", "shopping-cart", "pink-600"),
        ("Health", "heart", "red-500"),
        ("Other", "ellipsis-horizontal", "slate-500")
    };

    public async Task<List<CategoryResponse>> GetCategoriesAsync(string groupId, string userId)
    {
        // Ensure user is member of the group
        var group = await groupRepository.GetByIdAsync(groupId) ?? throw new KeyNotFoundException("Group not found");
        if (!group.Members.Any(m => m.UserId == userId))
            throw new UnauthorizedAccessException("You are not a member of this group");

        // System categories first
        var system = SystemCategories
            .Select(sc => new Category
            {
                Id = string.Empty,
                GroupId = groupId,
                Name = sc.Name,
                Icon = sc.Icon,
                Color = sc.Color,
                IsSystemCategory = true,
                CreatedAt = DateTime.MinValue
            }.ToResponse(0)) // Don't compute counts for system categories in MVP
            .ToList();

        // Custom categories
        var custom = await categoryRepository.GetByGroupAsync(groupId);
        var result = new List<CategoryResponse>(system.Count + custom.Count);
        result.AddRange(system);

        foreach (var c in custom)
        {
            var count = await categoryRepository.GetTaskCountAsync(c.Id);
            result.Add(c.ToResponse((int)count));
        }

        return result.OrderBy(c => c.Name).ToList();
    }

    public async Task<CategoryResponse> GetCategoryAsync(string id, string userId)
    {
        var category = await categoryRepository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Category not found");
        var group = await groupRepository.GetByIdAsync(category.GroupId) ?? throw new KeyNotFoundException("Group not found");
        if (!group.Members.Any(m => m.UserId == userId))
            throw new UnauthorizedAccessException("You are not a member of this group");

        var taskCount = await categoryRepository.GetTaskCountAsync(category.Id);
        return category.ToResponse((int)taskCount);
    }

    public async Task<CategoryResponse> CreateCategoryAsync(string groupId, CreateCategoryRequest request, string userId)
    {
        logger.LogInformation("Creating category {Name} in group {GroupId} by {UserId}", request.Name, groupId, userId);

        var group = await groupRepository.GetByIdAsync(groupId) ?? throw new KeyNotFoundException("Group not found");
        var member = group.Members.FirstOrDefault(m => m.UserId == userId);
        if (member?.Role != GroupRole.Admin) throw new UnauthorizedAccessException("Only admins can create categories");

        // Validate unique name within group (case-insensitive)
        if (await categoryRepository.NameExistsInGroupAsync(groupId, request.Name))
            throw new ArgumentException($"Category '{request.Name}' already exists");

        var category = new Category
        {
            GroupId = groupId,
            Name = request.Name.Trim(),
            Icon = request.Icon,
            Color = request.Color,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow,
            IsSystemCategory = false
        };

        var created = await categoryRepository.CreateAsync(category);
        return created.ToResponse(0);
    }

    public async Task<CategoryResponse> UpdateCategoryAsync(string id, UpdateCategoryRequest request, string userId)
    {
        var existing = await categoryRepository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Category not found");
        var group = await groupRepository.GetByIdAsync(existing.GroupId) ?? throw new KeyNotFoundException("Group not found");
        var member = group.Members.FirstOrDefault(m => m.UserId == userId);
        if (member?.Role != GroupRole.Admin) throw new UnauthorizedAccessException("Only admins can update categories");

        if (existing.IsSystemCategory) throw new InvalidOperationException("System categories cannot be edited");

        var newName = request.Name?.Trim();
        if (!string.IsNullOrWhiteSpace(newName))
        {
            if (await categoryRepository.NameExistsInGroupAsync(existing.GroupId, newName, existing.Id))
                throw new ArgumentException($"Category '{newName}' already exists");
            existing.Name = newName;
        }

        if (!string.IsNullOrWhiteSpace(request.Icon)) existing.Icon = request.Icon;
        if (!string.IsNullOrWhiteSpace(request.Color)) existing.Color = request.Color;

        var updated = await categoryRepository.UpdateAsync(existing);
        var count = await categoryRepository.GetTaskCountAsync(updated.Id);
        return updated.ToResponse((int)count);
    }

    public async Task DeleteCategoryAsync(string id, string userId)
    {
        var existing = await categoryRepository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Category not found");
        var group = await groupRepository.GetByIdAsync(existing.GroupId) ?? throw new KeyNotFoundException("Group not found");
        var member = group.Members.FirstOrDefault(m => m.UserId == userId);
        if (member?.Role != GroupRole.Admin) throw new UnauthorizedAccessException("Only admins can delete categories");

        if (existing.IsSystemCategory) throw new InvalidOperationException("System categories cannot be deleted");

        var count = await categoryRepository.GetTaskCountAsync(existing.Id);
        if (count > 0) throw new InvalidOperationException("Cannot delete category with assigned tasks");

        await categoryRepository.DeleteAsync(existing.Id);
        logger.LogInformation("Category {CategoryId} deleted by {UserId}", id, userId);
    }
}
