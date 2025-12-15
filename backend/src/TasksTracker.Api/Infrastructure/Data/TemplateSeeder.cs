using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Core.Interfaces;
using MongoDB.Bson;

namespace TasksTracker.Api.Infrastructure.Data;

public class TemplateSeeder
{
    private readonly ITemplateRepository _templateRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly ILogger<TemplateSeeder> _logger;

    public TemplateSeeder(
        ITemplateRepository templateRepository,
        ICategoryRepository categoryRepository,
        ILogger<TemplateSeeder> logger)
    {
        _templateRepository = templateRepository;
        _categoryRepository = categoryRepository;
        _logger = logger;
    }

    public async Task SeedSystemTemplatesAsync()
    {
        _logger.LogInformation("Starting system template seeding...");

        // Check if system templates already exist
        var existingTemplates = await _templateRepository.GetTemplatesForGroupAsync(
            groupId: null, 
            categoryId: null, 
            difficultyMin: null, 
            difficultyMax: null, 
            frequency: null);

        if (existingTemplates.Any())
        {
            _logger.LogInformation("System templates already exist ({Count} templates). Skipping seeding.", existingTemplates.Count);
            return;
        }

        // Load seed data from JSON file
        var seedFilePath = Path.Combine(AppContext.BaseDirectory, "Infrastructure", "Data", "task-templates-seed.json");
        
        if (!File.Exists(seedFilePath))
        {
            _logger.LogWarning("Seed data file not found at {Path}. Skipping template seeding.", seedFilePath);
            return;
        }

        var jsonContent = await File.ReadAllTextAsync(seedFilePath);
        var seedTemplates = JsonSerializer.Deserialize<List<TemplateSeedData>>(jsonContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (seedTemplates == null || !seedTemplates.Any())
        {
            _logger.LogWarning("No templates found in seed data file. Skipping seeding.");
            return;
        }

        _logger.LogInformation("Found {Count} templates to seed", seedTemplates.Count);

        // Get all categories for mapping
        var categories = await GetAllCategoriesAsync();
        var categoryMap = categories.ToDictionary(c => c.Name, c => c.Id, StringComparer.OrdinalIgnoreCase);

        // Create system templates
        var createdCount = 0;
        var skippedCount = 0;

        foreach (var seedData in seedTemplates)
        {
            try
            {
                // Map category name to ID
                string? categoryId = null;
                if (!string.IsNullOrWhiteSpace(seedData.CategoryName) && 
                    categoryMap.TryGetValue(seedData.CategoryName, out var mappedId))
                {
                    categoryId = mappedId;
                }
                else if (!string.IsNullOrWhiteSpace(seedData.CategoryName))
                {
                    _logger.LogWarning("Category '{CategoryName}' not found for template '{TemplateName}'", 
                        seedData.CategoryName, seedData.Name);
                }

                // Convert string frequency to enum
                if (!Enum.TryParse<TaskFrequency>(seedData.DefaultFrequency, true, out var frequency))
                {
                    _logger.LogWarning("Invalid frequency '{Frequency}' for template '{TemplateName}'. Skipping.", 
                        seedData.DefaultFrequency, seedData.Name);
                    skippedCount++;
                    continue;
                }

                var template = new TaskTemplate
                {
                    Id = ObjectId.GenerateNewId().ToString(),
                    Name = seedData.Name,
                    Description = seedData.Description,
                    CategoryId = categoryId,
                    DifficultyLevel = seedData.DifficultyLevel,
                    EstimatedDurationMinutes = seedData.EstimatedDurationMinutes,
                    DefaultFrequency = frequency,
                    IsSystemTemplate = true,
                    GroupId = null,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };

                await _templateRepository.CreateAsync(template);
                createdCount++;

                _logger.LogDebug("Created system template: {TemplateName}", template.Name);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating template '{TemplateName}'. Skipping.", seedData.Name);
                skippedCount++;
            }
        }

        _logger.LogInformation("System template seeding complete. Created: {CreatedCount}, Skipped: {SkippedCount}", 
            createdCount, skippedCount);
    }

    private async Task<List<Category>> GetAllCategoriesAsync()
    {
        // Get system categories only for system templates
        // Note: This is a simplified approach. In a real scenario, you might want to
        // create system categories if they don't exist, or map to existing system categories.
        try
        {
            // Attempt to get categories - this will depend on your Category repository implementation
            // For now, we'll return an empty list if there's an issue
            // You may need to adjust this based on your actual Category repository methods
            return new List<Category>();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not retrieve categories for template seeding");
            return new List<Category>();
        }
    }

    private class TemplateSeedData
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CategoryName { get; set; }
        public int DifficultyLevel { get; set; }
        public int? EstimatedDurationMinutes { get; set; }
        public string DefaultFrequency { get; set; } = string.Empty;
    }
}
