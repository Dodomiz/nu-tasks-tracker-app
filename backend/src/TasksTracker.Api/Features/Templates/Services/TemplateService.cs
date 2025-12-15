using Microsoft.Extensions.Logging;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Core.Interfaces;
using TasksTracker.Api.Features.Categories.Services;
using TasksTracker.Api.Features.Templates.Extensions;
using TasksTracker.Api.Features.Templates.Models;

namespace TasksTracker.Api.Features.Templates.Services;

public class TemplateService(
    ITemplateRepository templateRepository,
    IGroupRepository groupRepository,
    ICategoryRepository categoryRepository,
    ILogger<TemplateService> logger) : ITemplateService
{
    public async Task<List<TemplateResponse>> GetTemplatesAsync(
        string groupId, 
        string userId, 
        GetTemplatesQuery query)
    {
        logger.LogInformation("Getting templates for group {GroupId} by user {UserId}", groupId, userId);

        // Verify user is member of the group
        var group = await groupRepository.GetByIdAsync(groupId) 
            ?? throw new KeyNotFoundException("Group not found");
        
        if (!group.Members.Any(m => m.UserId == userId))
            throw new UnauthorizedAccessException("You are not a member of this group");

        // Get templates with filters
        var templates = await templateRepository.GetTemplatesForGroupAsync(
            groupId,
            query.CategoryId,
            query.DifficultyMin,
            query.DifficultyMax,
            query.Frequency);

        return templates.Select(t => t.ToResponse()).ToList();
    }

    public async Task<TemplateResponse> GetTemplateByIdAsync(string groupId, string id, string userId)
    {
        logger.LogInformation("Getting template {TemplateId} for group {GroupId} by user {UserId}", 
            id, groupId, userId);

        // Verify user is member of the group
        var group = await groupRepository.GetByIdAsync(groupId) 
            ?? throw new KeyNotFoundException("Group not found");
        
        if (!group.Members.Any(m => m.UserId == userId))
            throw new UnauthorizedAccessException("You are not a member of this group");

        var template = await templateRepository.GetByIdWithDeleteCheckAsync(id)
            ?? throw new KeyNotFoundException("Template not found");

        // Verify template is accessible (system or belongs to this group)
        if (!template.IsSystemTemplate && template.GroupId != groupId)
            throw new UnauthorizedAccessException("You do not have access to this template");

        return template.ToResponse();
    }

    public async Task<TemplateResponse> CreateTemplateAsync(
        string groupId, 
        CreateTemplateRequest request, 
        string userId)
    {
        logger.LogInformation("Creating template {Name} in group {GroupId} by user {UserId}", 
            request.Name, groupId, userId);

        // Verify user is admin of the group
        var group = await groupRepository.GetByIdAsync(groupId) 
            ?? throw new KeyNotFoundException("Group not found");
        
        var member = group.Members.FirstOrDefault(m => m.UserId == userId);
        if (member?.Role != GroupRole.Admin)
            throw new UnauthorizedAccessException("Only admins can create templates");

        // Validate category if provided
        if (!string.IsNullOrWhiteSpace(request.CategoryId))
        {
            var category = await categoryRepository.GetByIdAsync(request.CategoryId);
            if (category == null)
            {
                logger.LogWarning("Category {CategoryId} not found, template will be created without category", 
                    request.CategoryId);
                request.CategoryId = null; // Set to null if category doesn't exist
            }
            else if (category.GroupId != groupId && !category.IsSystemCategory)
            {
                throw new ArgumentException("Category does not belong to this group");
            }
        }

        // Check for duplicate name within group
        if (await templateRepository.NameExistsInGroupAsync(groupId, request.Name))
            throw new ArgumentException($"A template with the name '{request.Name}' already exists in this group");

        // Create template entity
        var template = request.ToEntity(groupId, userId);
        
        // Save to repository
        var created = await templateRepository.CreateAsync(template);
        
        logger.LogInformation("Template {TemplateId} created successfully", created.Id);
        
        return created.ToResponse();
    }

    public async Task<TemplateResponse> UpdateTemplateAsync(
        string groupId, 
        string id, 
        UpdateTemplateRequest request, 
        string userId)
    {
        logger.LogInformation("Updating template {TemplateId} in group {GroupId} by user {UserId}", 
            id, groupId, userId);

        // Verify user is admin of the group
        var group = await groupRepository.GetByIdAsync(groupId) 
            ?? throw new KeyNotFoundException("Group not found");
        
        var member = group.Members.FirstOrDefault(m => m.UserId == userId);
        if (member?.Role != GroupRole.Admin)
            throw new UnauthorizedAccessException("Only admins can update templates");

        // Get existing template
        var template = await templateRepository.GetByIdWithDeleteCheckAsync(id)
            ?? throw new KeyNotFoundException("Template not found");

        // Verify template belongs to this group
        if (template.GroupId != groupId)
            throw new UnauthorizedAccessException("Template does not belong to this group");

        // System templates are read-only
        if (template.IsSystemTemplate)
            throw new InvalidOperationException("System templates cannot be modified");

        // Validate category if provided
        if (!string.IsNullOrWhiteSpace(request.CategoryId))
        {
            var category = await categoryRepository.GetByIdAsync(request.CategoryId);
            if (category == null)
            {
                logger.LogWarning("Category {CategoryId} not found, template will be updated without category", 
                    request.CategoryId);
                request.CategoryId = null;
            }
            else if (category.GroupId != groupId && !category.IsSystemCategory)
            {
                throw new ArgumentException("Category does not belong to this group");
            }
        }

        // Check for duplicate name within group (excluding current template)
        if (await templateRepository.NameExistsInGroupAsync(groupId, request.Name, id))
            throw new ArgumentException($"A template with the name '{request.Name}' already exists in this group");

        // Update template fields
        template.Name = request.Name.Trim();
        template.Description = request.Description?.Trim();
        template.CategoryId = request.CategoryId;
        template.DifficultyLevel = request.DifficultyLevel;
        template.EstimatedDurationMinutes = request.EstimatedDurationMinutes;
        template.DefaultFrequency = request.DefaultFrequency;

        // Save changes
        var updated = await templateRepository.UpdateAsync(template);
        
        logger.LogInformation("Template {TemplateId} updated successfully", updated.Id);
        
        return updated.ToResponse();
    }

    public async Task DeleteTemplateAsync(string groupId, string id, string userId)
    {
        logger.LogInformation("Deleting template {TemplateId} from group {GroupId} by user {UserId}", 
            id, groupId, userId);

        // Verify user is admin of the group
        var group = await groupRepository.GetByIdAsync(groupId) 
            ?? throw new KeyNotFoundException("Group not found");
        
        var member = group.Members.FirstOrDefault(m => m.UserId == userId);
        if (member?.Role != GroupRole.Admin)
            throw new UnauthorizedAccessException("Only admins can delete templates");

        // Get existing template
        var template = await templateRepository.GetByIdWithDeleteCheckAsync(id)
            ?? throw new KeyNotFoundException("Template not found");

        // Verify template belongs to this group
        if (template.GroupId != groupId)
            throw new UnauthorizedAccessException("Template does not belong to this group");

        // System templates cannot be deleted
        if (template.IsSystemTemplate)
            throw new InvalidOperationException("System templates cannot be deleted");

        // Soft delete
        var deleted = await templateRepository.SoftDeleteAsync(id);
        
        if (!deleted)
            throw new InvalidOperationException("Failed to delete template");
        
        logger.LogInformation("Template {TemplateId} deleted successfully", id);
    }
}
