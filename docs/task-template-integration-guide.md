# Task-Template Integration Guide

## Overview
This document describes how to extend the Task domain model and creation workflow to support task creation from templates (US-009).

**Status:** Ready to implement when Task entity is created  
**Dependencies:** TaskTemplate system (✅ Complete), Task entity (⏳ Pending)

---

## 1. Domain Model Extension

### File: `backend/src/TasksTracker.Api/Core/Domain/Task.cs`

Add these fields to the Task entity:

```csharp
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class Task
{
    // ... existing fields (Id, Name, Description, CategoryId, DifficultyLevel, etc.) ...
    
    /// <summary>
    /// ID of template used to create this task (null if created manually)
    /// </summary>
    [BsonRepresentation(BsonType.ObjectId)]
    public string? TemplateId { get; set; }
    
    /// <summary>
    /// Snapshot of template name at task creation time (audit trail)
    /// Preserved even if original template is renamed/deleted
    /// </summary>
    [StringLength(100)]
    public string? TemplateName { get; set; }
}
```

**Rationale:**
- `TemplateId`: Enables tracking which template was used (analytics, reporting)
- `TemplateName`: Audit trail - preserves template name even if template is deleted
- Both nullable: Tasks can still be created without templates

---

## 2. DTO Extension

### File: `backend/src/TasksTracker.Api/Features/Tasks/Models/TaskModels.cs`

#### Request Model
```csharp
public record CreateTaskRequest
{
    // ... existing fields (Name, Description, AssignedToUserId, DueDate, etc.) ...
    
    /// <summary>
    /// Optional: ID of template to use as basis for task creation
    /// When provided, pre-fills Name, Description, CategoryId, DifficultyLevel, DefaultFrequency
    /// Request fields override template values (e.g., custom name, different assignee)
    /// </summary>
    [BsonRepresentation(BsonType.ObjectId)]
    public string? TemplateId { get; set; }
}
```

#### Response Model
```csharp
public record TaskResponse
{
    // ... existing fields ...
    
    public string? TemplateId { get; set; }
    public string? TemplateName { get; set; }
}
```

---

## 3. Service Layer Changes

### File: `backend/src/TasksTracker.Api/Features/Tasks/Services/TaskService.cs`

#### Constructor Injection
Add `ITemplateRepository` to constructor:

```csharp
public class TaskService(
    ITaskRepository taskRepository,
    IGroupRepository groupRepository,
    ICategoryRepository categoryRepository,
    ITemplateRepository templateRepository, // NEW
    ILogger<TaskService> logger) : ITaskService
{
    // ...
}
```

#### CreateTaskAsync Method
Update the method to handle template-based creation:

```csharp
public async Task<TaskResponse> CreateTaskAsync(string groupId, CreateTaskRequest request, string userId)
{
    // 1. Existing validation (group exists, user is member, etc.)
    // ... existing code ...

    // 2. NEW: Handle template-based creation
    TaskTemplate? template = null;
    if (!string.IsNullOrEmpty(request.TemplateId))
    {
        template = await LoadAndValidateTemplateAsync(groupId, request.TemplateId);
    }

    // 3. Create task entity
    var task = new Task
    {
        Id = ObjectId.GenerateNewId().ToString(),
        GroupId = groupId,
        
        // If template provided, use template values as defaults (request can override)
        Name = request.Name ?? template?.Name 
            ?? throw new ArgumentException("Task name is required"),
        Description = request.Description ?? template?.Description,
        CategoryId = request.CategoryId ?? template?.CategoryId,
        DifficultyLevel = request.DifficultyLevel ?? template?.DifficultyLevel ?? 1,
        EstimatedDurationMinutes = request.EstimatedDurationMinutes 
            ?? template?.EstimatedDurationMinutes,
        RecurrenceFrequency = request.RecurrenceFrequency 
            ?? template?.DefaultFrequency,
        
        // Template audit trail
        TemplateId = template?.Id,
        TemplateName = template?.Name,
        
        // Task-specific fields (not from template)
        AssignedToUserId = request.AssignedToUserId,
        DueDate = request.DueDate,
        CreatedBy = userId,
        CreatedAt = DateTime.UtcNow,
        Status = TaskStatus.Pending,
        IsDeleted = false
    };

    // 4. Save and return
    await taskRepository.CreateAsync(task);
    return task.ToResponse();
}

private async Task<TaskTemplate> LoadAndValidateTemplateAsync(string groupId, string templateId)
{
    var template = await templateRepository.GetByIdAsync(templateId);
    
    if (template == null || template.IsDeleted)
    {
        throw new KeyNotFoundException($"Template with ID '{templateId}' not found");
    }

    // Validate access: template must be system-wide OR belong to same group
    if (!template.IsSystemTemplate && template.GroupId != groupId)
    {
        throw new UnauthorizedAccessException(
            "Cannot use template from different group");
    }

    return template;
}
```

---

## 4. Controller Changes

### File: `backend/src/TasksTracker.Api/Features/Tasks/Controllers/TasksController.cs`

No changes needed – controller just passes `CreateTaskRequest` to service.  
DTOs already include `TemplateId` field.

---

## 5. Error Handling

### New Error Codes
Add these error responses to standardized error handling:

| Error Code | HTTP Status | Condition |
|------------|-------------|-----------|
| `TEMPLATE_NOT_FOUND` | 404 | TemplateId provided but template doesn't exist or is deleted |
| `TEMPLATE_ACCESS_DENIED` | 403 | Template is group-specific and doesn't match task's groupId |
| `VALIDATION_ERROR` | 400 | Neither Name nor TemplateId provided (missing required data) |

### Example Error Response
```json
{
  "success": false,
  "errorCode": "TEMPLATE_NOT_FOUND",
  "errorMessage": "Template with ID '674abc123def456789' not found",
  "data": null
}
```

---

## 6. Frontend Integration

### Update RTK Query Mutation
File: `web/src/features/tasks/api/taskApi.ts`

```typescript
export const taskApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createTask: builder.mutation<TaskResponse, CreateTaskRequest>({
      query: ({ groupId, ...body }) => ({
        url: `/groups/${groupId}/tasks`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Task'],
    }),
  }),
});
```

### Task Creation Form Integration
The production task creation form is in `web/src/components/CreateTaskForm.tsx`.  
Template integration for task creation is planned for a future epic.

---

## 7. Testing Requirements

### Unit Tests
File: `backend/tests/TasksTracker.Api.Tests/Tasks/TaskServiceTests.cs`

```csharp
[Fact]
public async Task CreateTaskAsync_WithValidTemplate_PopulatesTaskFields()
{
    // Arrange: setup template repository mock
    var template = new TaskTemplate 
    { 
        Id = "674abc", 
        Name = "Clean Kitchen", 
        DifficultyLevel = 3,
        IsSystemTemplate = true 
    };
    _templateRepositoryMock
        .Setup(r => r.GetByIdAsync("674abc"))
        .ReturnsAsync(template);

    var request = new CreateTaskRequest 
    { 
        TemplateId = "674abc",
        AssignedToUserId = "user1",
        DueDate = DateTime.UtcNow.AddDays(1)
    };

    // Act
    var result = await _taskService.CreateTaskAsync("group1", request, "admin1");

    // Assert
    Assert.Equal("Clean Kitchen", result.Name);
    Assert.Equal(3, result.DifficultyLevel);
    Assert.Equal("674abc", result.TemplateId);
    Assert.Equal("Clean Kitchen", result.TemplateName);
}

[Fact]
public async Task CreateTaskAsync_WithDeletedTemplate_ThrowsKeyNotFoundException()
{
    // Arrange
    _templateRepositoryMock
        .Setup(r => r.GetByIdAsync("deleted-template"))
        .ReturnsAsync((TaskTemplate?)null);

    var request = new CreateTaskRequest { TemplateId = "deleted-template" };

    // Act & Assert
    await Assert.ThrowsAsync<KeyNotFoundException>(() =>
        _taskService.CreateTaskAsync("group1", request, "admin1"));
}

[Fact]
public async Task CreateTaskAsync_WithGroupTemplate_FromDifferentGroup_ThrowsUnauthorizedAccessException()
{
    // Arrange
    var template = new TaskTemplate 
    { 
        Id = "template1",
        GroupId = "groupA", // Different from request groupId
        IsSystemTemplate = false 
    };
    _templateRepositoryMock
        .Setup(r => r.GetByIdAsync("template1"))
        .ReturnsAsync(template);

    var request = new CreateTaskRequest { TemplateId = "template1" };

    // Act & Assert
    await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
        _taskService.CreateTaskAsync("groupB", request, "user1"));
}

[Fact]
public async Task CreateTaskAsync_RequestFieldsOverrideTemplateDefaults()
{
    // Arrange
    var template = new TaskTemplate 
    { 
        Id = "template1",
        Name = "Template Name",
        DifficultyLevel = 5,
        IsSystemTemplate = true
    };
    _templateRepositoryMock
        .Setup(r => r.GetByIdAsync("template1"))
        .ReturnsAsync(template);

    var request = new CreateTaskRequest 
    { 
        TemplateId = "template1",
        Name = "Custom Name",  // Override template name
        DifficultyLevel = 8    // Override template difficulty
    };

    // Act
    var result = await _taskService.CreateTaskAsync("group1", request, "admin1");

    // Assert
    Assert.Equal("Custom Name", result.Name);
    Assert.Equal(8, result.DifficultyLevel);
    Assert.Equal("template1", result.TemplateId);  // Still tracks original template
}
```

### Integration Tests
File: `backend/tests/TasksTracker.Api.IntegrationTests/Tasks/CreateTaskFromTemplateTests.cs`

```csharp
[Fact]
public async Task POST_CreateTask_WithSystemTemplate_Returns201()
{
    // Arrange: seed system template
    var template = await SeedTemplateAsync(new TaskTemplate
    {
        Name = "Mow Lawn",
        DifficultyLevel = 7,
        IsSystemTemplate = true
    });

    var request = new CreateTaskRequest
    {
        TemplateId = template.Id,
        AssignedToUserId = TestUserId,
        DueDate = DateTime.UtcNow.AddDays(7)
    };

    // Act
    var response = await _client.PostAsJsonAsync(
        $"/api/groups/{TestGroupId}/tasks", request);

    // Assert
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    var result = await response.Content.ReadFromJsonAsync<ApiResponse<TaskResponse>>();
    Assert.Equal("Mow Lawn", result.Data.Name);
    Assert.Equal(7, result.Data.DifficultyLevel);
    Assert.Equal(template.Id, result.Data.TemplateId);
}
```

---

## 8. Migration Checklist

When implementing Tasks feature, follow this checklist:

- [ ] Add `TemplateId` and `TemplateName` fields to Task domain model
- [ ] Add `TemplateId` to `CreateTaskRequest` DTO
- [ ] Inject `ITemplateRepository` into TaskService constructor
- [ ] Implement `LoadAndValidateTemplateAsync` helper method
- [ ] Update `CreateTaskAsync` to check for templateId and load template
- [ ] Add null-coalescing logic for template vs request field priority
- [ ] Add error handling for template not found / access denied
- [ ] Update TaskResponse to include template fields
- [ ] Add unit tests for template-based task creation
- [ ] Add integration tests for API endpoints
- [ ] Update frontend taskApi to send templateId in request
- [ ] Test end-to-end: template selection → task creation → verification

---

## 9. Analytics & Reporting

### Tracking Template Usage
Once implemented, track these metrics:

```sql
-- MongoDB aggregation: Template usage statistics
db.tasks.aggregate([
  { $match: { TemplateId: { $ne: null } } },
  { $group: { 
      _id: "$TemplateId", 
      usageCount: { $sum: 1 },
      templateName: { $first: "$TemplateName" }
  }},
  { $sort: { usageCount: -1 } },
  { $limit: 10 }
])
```

**Business Value:**
- Identify most popular templates (consider promoting to system templates)
- Detect unused templates (candidates for archival)
- Measure template adoption rate (target: 60% of tasks from templates)

---

## 10. Future Enhancements

### Phase 2 Features
- **Template Version History:** Track template changes, allow rollback
- **Smart Suggestions:** AI recommends templates based on task name input
- **Batch Task Creation:** Create multiple recurring tasks from single template selection
- **Template Analytics:** Show which templates lead to highest completion rates

### Non-Functional Improvements
- **Caching:** Cache frequently used system templates in Redis
- **Preloading:** Frontend pre-fetches top 20 templates on dashboard load
- **Lazy Loading:** Paginate template list if library exceeds 100 items

---

## Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| TaskTemplate Backend | ✅ Complete | US-005 through US-008 |
| TaskTemplate Frontend | ✅ Complete | US-001 through US-004 |
| Task Domain Extension | ⏳ Pending | Blocked on Task entity creation |
| Task Service Updates | ⏳ Pending | Depends on Task domain model |
| Integration Tests | ⏳ Pending | Requires Task endpoints |

**Next Step:** Implement Tasks feature (FR-001: Task Management), then apply this guide to integrate templates.
