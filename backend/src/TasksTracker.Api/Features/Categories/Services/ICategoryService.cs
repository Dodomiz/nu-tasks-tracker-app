using TasksTracker.Api.Features.Categories.Models;

namespace TasksTracker.Api.Features.Categories.Services;

public interface ICategoryService
{
    Task<List<CategoryResponse>> GetCategoriesAsync(string groupId, string userId);
    Task<CategoryResponse> GetCategoryAsync(string id, string userId);
    Task<CategoryResponse> CreateCategoryAsync(string groupId, CreateCategoryRequest request, string userId);
    Task<CategoryResponse> UpdateCategoryAsync(string id, UpdateCategoryRequest request, string userId);
    Task DeleteCategoryAsync(string id, string userId);
}
