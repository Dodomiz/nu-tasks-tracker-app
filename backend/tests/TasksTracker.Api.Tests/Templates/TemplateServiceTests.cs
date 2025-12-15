using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using FluentAssertions;
using TasksTracker.Api.Features.Templates.Services;
using TasksTracker.Api.Core.Interfaces;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Features.Templates.Models;

namespace TasksTracker.Api.Tests.Templates;

public class TemplateServiceTests
{
    private readonly Mock<ITemplateRepository> _templateRepositoryMock;
    private readonly Mock<IGroupRepository> _groupRepositoryMock;
    private readonly Mock<ICategoryRepository> _categoryRepositoryMock;
    private readonly Mock<ILogger<TemplateService>> _loggerMock;
    private readonly TemplateService _templateService;

    public TemplateServiceTests()
    {
        _templateRepositoryMock = new Mock<ITemplateRepository>();
        _groupRepositoryMock = new Mock<IGroupRepository>();
        _categoryRepositoryMock = new Mock<ICategoryRepository>();
        _loggerMock = new Mock<ILogger<TemplateService>>();
        _templateService = new TemplateService(
            _templateRepositoryMock.Object,
            _groupRepositoryMock.Object,
            _categoryRepositoryMock.Object,
            _loggerMock.Object);
    }

    #region GetTemplatesAsync Tests

    [Fact]
    public async Task GetTemplatesAsync_WithValidGroupId_ReturnsTemplates()
    {
        // Arrange
        var groupId = "group1";
        var userId = "user1";
        var group = new Group { Id = groupId, Name = "Test Group" };
        var member = new GroupMember { UserId = userId, Role = GroupRole.Admin };
        group.Members.Add(member);

        var templates = new List<TaskTemplate>
        {
            new() { Id = "1", Name = "Template 1", IsSystemTemplate = true, DifficultyLevel = 5, DefaultFrequency = TaskFrequency.Weekly },
            new() { Id = "2", Name = "Template 2", IsSystemTemplate = false, GroupId = groupId, DifficultyLevel = 3, DefaultFrequency = TaskFrequency.Daily }
        };

        _groupRepositoryMock.Setup(r => r.GetByIdAsync(groupId)).ReturnsAsync(group);
        _templateRepositoryMock.Setup(r => r.GetTemplatesForGroupAsync(groupId, null, null, null, null))
            .ReturnsAsync(templates);

        var query = new GetTemplatesQuery();

        // Act
        var result = await _templateService.GetTemplatesAsync(groupId, userId, query);

        // Assert
        result.Should().HaveCount(2);
        result.Should().Contain(t => t.Name == "Template 1");
        result.Should().Contain(t => t.Name == "Template 2");
    }

    [Fact]
    public async Task GetTemplatesAsync_WithNonExistentGroup_ThrowsKeyNotFoundException()
    {
        // Arrange
        var groupId = "nonexistent";
        var userId = "user1";
        _groupRepositoryMock.Setup(r => r.GetByIdAsync(groupId)).ReturnsAsync((Group?)null);

        var query = new GetTemplatesQuery();

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _templateService.GetTemplatesAsync(groupId, userId, query));
    }

    [Fact]
    public async Task GetTemplatesAsync_WithNonMember_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var groupId = "group1";
        var userId = "nonmember";
        var group = new Group { Id = groupId, Name = "Test Group" };

        _groupRepositoryMock.Setup(r => r.GetByIdAsync(groupId)).ReturnsAsync(group);

        var query = new GetTemplatesQuery();

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _templateService.GetTemplatesAsync(groupId, userId, query));
    }

    [Fact]
    public async Task GetTemplatesAsync_WithFilters_PassesFiltersToRepository()
    {
        // Arrange
        var groupId = "group1";
        var userId = "user1";
        var group = new Group { Id = groupId, Name = "Test Group" };
        var member = new GroupMember { UserId = userId, Role = GroupRole.Admin };
        group.Members.Add(member);

        _groupRepositoryMock.Setup(r => r.GetByIdAsync(groupId)).ReturnsAsync(group);
        _templateRepositoryMock.Setup(r => r.GetTemplatesForGroupAsync(
            groupId, "cat1", 3, 7, TaskFrequency.Weekly))
            .ReturnsAsync(new List<TaskTemplate>());

        var query = new GetTemplatesQuery
        {
            CategoryId = "cat1",
            DifficultyMin = 3,
            DifficultyMax = 7,
            Frequency = TaskFrequency.Weekly
        };

        // Act
        var result = await _templateService.GetTemplatesAsync(groupId, userId, query);

        // Assert
        _templateRepositoryMock.Verify(
            r => r.GetTemplatesForGroupAsync(groupId, "cat1", 3, 7, TaskFrequency.Weekly),
            Times.Once);
    }

    #endregion

    #region CreateTemplateAsync Tests

    [Fact]
    public async Task CreateTemplateAsync_WithValidData_CreatesTemplate()
    {
        // Arrange
        var groupId = "group1";
        var userId = "admin1";
        var group = new Group { Id = groupId, Name = "Test Group" };
        var member = new GroupMember { UserId = userId, Role = GroupRole.Admin };
        group.Members.Add(member);

        var request = new CreateTemplateRequest
        {
            Name = "New Template",
            Description = "Test description",
            DifficultyLevel = 5,
            EstimatedDurationMinutes = 30,
            DefaultFrequency = TaskFrequency.Weekly
        };

        _groupRepositoryMock.Setup(r => r.GetByIdAsync(groupId)).ReturnsAsync(group);
        _templateRepositoryMock.Setup(r => r.NameExistsInGroupAsync(groupId, request.Name, null))
            .ReturnsAsync(false);
        _templateRepositoryMock.Setup(r => r.CreateAsync(It.IsAny<TaskTemplate>()))
            .ReturnsAsync((TaskTemplate t) => t);

        // Act
        var result = await _templateService.CreateTemplateAsync(groupId, request, userId);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("New Template");
        result.DifficultyLevel.Should().Be(5);
        result.IsSystemTemplate.Should().BeFalse();
        result.GroupId.Should().Be(groupId);

        _templateRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<TaskTemplate>()), Times.Once);
    }

    [Fact]
    public async Task CreateTemplateAsync_WithNonAdmin_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var groupId = "group1";
        var userId = "user1";
        var group = new Group { Id = groupId, Name = "Test Group" };
        var member = new GroupMember { UserId = userId, Role = GroupRole.RegularUser };
        group.Members.Add(member);

        var request = new CreateTemplateRequest { Name = "Test", DifficultyLevel = 5, DefaultFrequency = TaskFrequency.Weekly };

        _groupRepositoryMock.Setup(r => r.GetByIdAsync(groupId)).ReturnsAsync(group);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _templateService.CreateTemplateAsync(groupId, request, userId));
    }

    [Fact]
    public async Task CreateTemplateAsync_WithDuplicateName_ThrowsArgumentException()
    {
        // Arrange
        var groupId = "group1";
        var userId = "admin1";
        var group = new Group { Id = groupId, Name = "Test Group" };
        var member = new GroupMember { UserId = userId, Role = GroupRole.Admin };
        group.Members.Add(member);

        var request = new CreateTemplateRequest { Name = "Duplicate", DifficultyLevel = 5, DefaultFrequency = TaskFrequency.Weekly };

        _groupRepositoryMock.Setup(r => r.GetByIdAsync(groupId)).ReturnsAsync(group);
        _templateRepositoryMock.Setup(r => r.NameExistsInGroupAsync(groupId, request.Name, null))
            .ReturnsAsync(true);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => _templateService.CreateTemplateAsync(groupId, request, userId));
        exception.Message.Should().Contain("already exists");
    }

    [Fact]
    public async Task CreateTemplateAsync_WithValidCategoryId_ValidatesCategory()
    {
        // Arrange
        var groupId = "group1";
        var userId = "admin1";
        var categoryId = "cat1";
        var group = new Group { Id = groupId, Name = "Test Group" };
        var member = new GroupMember { UserId = userId, Role = GroupRole.Admin };
        group.Members.Add(member);

        var category = new Category { Id = categoryId, Name = "Test Category", GroupId = groupId };

        var request = new CreateTemplateRequest
        {
            Name = "Template with Category",
            CategoryId = categoryId,
            DifficultyLevel = 5,
            DefaultFrequency = TaskFrequency.Weekly
        };

        _groupRepositoryMock.Setup(r => r.GetByIdAsync(groupId)).ReturnsAsync(group);
        _categoryRepositoryMock.Setup(r => r.GetByIdAsync(categoryId)).ReturnsAsync(category);
        _templateRepositoryMock.Setup(r => r.NameExistsInGroupAsync(groupId, request.Name, null))
            .ReturnsAsync(false);
        _templateRepositoryMock.Setup(r => r.CreateAsync(It.IsAny<TaskTemplate>()))
            .ReturnsAsync((TaskTemplate t) => t);

        // Act
        var result = await _templateService.CreateTemplateAsync(groupId, request, userId);

        // Assert
        result.CategoryId.Should().Be(categoryId);
        _categoryRepositoryMock.Verify(r => r.GetByIdAsync(categoryId), Times.Once);
    }

    [Fact]
    public async Task CreateTemplateAsync_WithInvalidCategoryId_SetsCategoryToNull()
    {
        // Arrange
        var groupId = "group1";
        var userId = "admin1";
        var categoryId = "invalid";
        var group = new Group { Id = groupId, Name = "Test Group" };
        var member = new GroupMember { UserId = userId, Role = GroupRole.Admin };
        group.Members.Add(member);

        var request = new CreateTemplateRequest
        {
            Name = "Template",
            CategoryId = categoryId,
            DifficultyLevel = 5,
            DefaultFrequency = TaskFrequency.Weekly
        };

        _groupRepositoryMock.Setup(r => r.GetByIdAsync(groupId)).ReturnsAsync(group);
        _categoryRepositoryMock.Setup(r => r.GetByIdAsync(categoryId)).ReturnsAsync((Category?)null);
        _templateRepositoryMock.Setup(r => r.NameExistsInGroupAsync(groupId, request.Name, null))
            .ReturnsAsync(false);
        _templateRepositoryMock.Setup(r => r.CreateAsync(It.IsAny<TaskTemplate>()))
            .ReturnsAsync((TaskTemplate t) => t);

        // Act
        var result = await _templateService.CreateTemplateAsync(groupId, request, userId);

        // Assert
        result.CategoryId.Should().BeNull();
    }

    #endregion

    #region UpdateTemplateAsync Tests

    [Fact]
    public async Task UpdateTemplateAsync_WithValidGroupTemplate_UpdatesTemplate()
    {
        // Arrange
        var groupId = "group1";
        var templateId = "template1";
        var userId = "admin1";
        var group = new Group { Id = groupId, Name = "Test Group" };
        var member = new GroupMember { UserId = userId, Role = GroupRole.Admin };
        group.Members.Add(member);

        var existingTemplate = new TaskTemplate
        {
            Id = templateId,
            Name = "Old Name",
            IsSystemTemplate = false,
            GroupId = groupId,
            DifficultyLevel = 3,
            DefaultFrequency = TaskFrequency.Weekly
        };

        var request = new UpdateTemplateRequest
        {
            Name = "Updated Name",
            DifficultyLevel = 7,
            DefaultFrequency = TaskFrequency.Daily
        };

        _groupRepositoryMock.Setup(r => r.GetByIdAsync(groupId)).ReturnsAsync(group);
        _templateRepositoryMock.Setup(r => r.GetByIdWithDeleteCheckAsync(templateId)).ReturnsAsync(existingTemplate);
        _templateRepositoryMock.Setup(r => r.UpdateAsync(It.IsAny<TaskTemplate>()))
            .ReturnsAsync((TaskTemplate t) => t);

        // Act
        var result = await _templateService.UpdateTemplateAsync(groupId, templateId, request, userId);

        // Assert
        result.Name.Should().Be("Updated Name");
        result.DifficultyLevel.Should().Be(7);
        _templateRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<TaskTemplate>()), Times.Once);
    }

    [Fact]
    public async Task UpdateTemplateAsync_WithSystemTemplate_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var groupId = "group1";
        var templateId = "system-template";
        var userId = "admin1";
        var group = new Group { Id = groupId, Name = "Test Group" };
        var member = new GroupMember { UserId = userId, Role = GroupRole.Admin };
        group.Members.Add(member);

        var systemTemplate = new TaskTemplate
        {
            Id = templateId,
            Name = "System Template",
            IsSystemTemplate = true,
            GroupId = null,
            DifficultyLevel = 5,
            DefaultFrequency = TaskFrequency.Weekly
        };

        var request = new UpdateTemplateRequest { Name = "Updated", DifficultyLevel = 7, DefaultFrequency = TaskFrequency.Weekly };

        _groupRepositoryMock.Setup(r => r.GetByIdAsync(groupId)).ReturnsAsync(group);
        _templateRepositoryMock.Setup(r => r.GetByIdWithDeleteCheckAsync(templateId)).ReturnsAsync(systemTemplate);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _templateService.UpdateTemplateAsync(groupId, templateId, request, userId));
        exception.Message.Should().Contain("Template does not belong to this group");
    }

    [Fact]
    public async Task UpdateTemplateAsync_WithNonAdmin_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var groupId = "group1";
        var templateId = "template1";
        var userId = "user1";
        var group = new Group { Id = groupId, Name = "Test Group" };
        var member = new GroupMember { UserId = userId, Role = GroupRole.RegularUser };
        group.Members.Add(member);

        var template = new TaskTemplate { Id = templateId, Name = "Test", IsSystemTemplate = false, GroupId = groupId, DifficultyLevel = 5, DefaultFrequency = TaskFrequency.Weekly };
        var request = new UpdateTemplateRequest { Name = "Updated", DifficultyLevel = 5, DefaultFrequency = TaskFrequency.Weekly };

        _groupRepositoryMock.Setup(r => r.GetByIdAsync(groupId)).ReturnsAsync(group);
        _templateRepositoryMock.Setup(r => r.GetByIdWithDeleteCheckAsync(templateId)).ReturnsAsync(template);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _templateService.UpdateTemplateAsync(groupId, templateId, request, userId));
    }

    [Fact]
    public async Task UpdateTemplateAsync_WithNonExistentTemplate_ThrowsKeyNotFoundException()
    {
        // Arrange
        var groupId = "group1";
        var templateId = "nonexistent";
        var userId = "admin1";
        var group = new Group { Id = groupId, Name = "Test Group" };
        var member = new GroupMember { UserId = userId, Role = GroupRole.Admin };
        group.Members.Add(member);

        var request = new UpdateTemplateRequest { Name = "Updated", DifficultyLevel = 5, DefaultFrequency = TaskFrequency.Weekly };

        _groupRepositoryMock.Setup(r => r.GetByIdAsync(groupId)).ReturnsAsync(group);
        _templateRepositoryMock.Setup(r => r.GetByIdWithDeleteCheckAsync(templateId)).ReturnsAsync((TaskTemplate?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _templateService.UpdateTemplateAsync(groupId, templateId, request, userId));
    }

    #endregion

    #region DeleteTemplateAsync Tests

    [Fact]
    public async Task DeleteTemplateAsync_WithValidGroupTemplate_DeletesTemplate()
    {
        // Arrange
        var groupId = "group1";
        var templateId = "template1";
        var userId = "admin1";
        var group = new Group { Id = groupId, Name = "Test Group" };
        var member = new GroupMember { UserId = userId, Role = GroupRole.Admin };
        group.Members.Add(member);

        var template = new TaskTemplate
        {
            Id = templateId,
            Name = "Template to Delete",
            IsSystemTemplate = false,
            GroupId = groupId,
            DifficultyLevel = 5,
            DefaultFrequency = TaskFrequency.Weekly
        };

        _groupRepositoryMock.Setup(r => r.GetByIdAsync(groupId)).ReturnsAsync(group);
        _templateRepositoryMock.Setup(r => r.GetByIdWithDeleteCheckAsync(templateId)).ReturnsAsync(template);
        _templateRepositoryMock.Setup(r => r.SoftDeleteAsync(templateId)).ReturnsAsync(true);

        // Act
        await _templateService.DeleteTemplateAsync(groupId, templateId, userId);

        // Assert
        _templateRepositoryMock.Verify(r => r.SoftDeleteAsync(templateId), Times.Once);
    }

    [Fact]
    public async Task DeleteTemplateAsync_WithSystemTemplate_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var groupId = "group1";
        var templateId = "system-template";
        var userId = "admin1";
        var group = new Group { Id = groupId, Name = "Test Group" };
        var member = new GroupMember { UserId = userId, Role = GroupRole.Admin };
        group.Members.Add(member);

        var systemTemplate = new TaskTemplate
        {
            Id = templateId,
            Name = "System Template",
            IsSystemTemplate = true,
            DifficultyLevel = 5,
            DefaultFrequency = TaskFrequency.Weekly
        };

        _groupRepositoryMock.Setup(r => r.GetByIdAsync(groupId)).ReturnsAsync(group);
        _templateRepositoryMock.Setup(r => r.GetByIdWithDeleteCheckAsync(templateId)).ReturnsAsync(systemTemplate);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _templateService.DeleteTemplateAsync(groupId, templateId, userId));
        exception.Message.Should().Contain("Template does not belong to this group");
    }

    [Fact]
    public async Task DeleteTemplateAsync_WithNonAdmin_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var groupId = "group1";
        var templateId = "template1";
        var userId = "user1";
        var group = new Group { Id = groupId, Name = "Test Group" };
        var member = new GroupMember { UserId = userId, Role = GroupRole.RegularUser };
        group.Members.Add(member);

        var template = new TaskTemplate { Id = templateId, Name = "Test", IsSystemTemplate = false, GroupId = groupId, DifficultyLevel = 5, DefaultFrequency = TaskFrequency.Weekly };

        _groupRepositoryMock.Setup(r => r.GetByIdAsync(groupId)).ReturnsAsync(group);
        _templateRepositoryMock.Setup(r => r.GetByIdWithDeleteCheckAsync(templateId)).ReturnsAsync(template);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _templateService.DeleteTemplateAsync(groupId, templateId, userId));
    }

    [Fact]
    public async Task DeleteTemplateAsync_WithNonExistentTemplate_ThrowsKeyNotFoundException()
    {
        // Arrange
        var groupId = "group1";
        var templateId = "nonexistent";
        var userId = "admin1";
        var group = new Group { Id = groupId, Name = "Test Group" };
        var member = new GroupMember { UserId = userId, Role = GroupRole.Admin };
        group.Members.Add(member);

        _groupRepositoryMock.Setup(r => r.GetByIdAsync(groupId)).ReturnsAsync(group);
        _templateRepositoryMock.Setup(r => r.GetByIdWithDeleteCheckAsync(templateId)).ReturnsAsync((TaskTemplate?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _templateService.DeleteTemplateAsync(groupId, templateId, userId));
    }

    #endregion

    #region GetTemplateByIdAsync Tests

    [Fact]
    public async Task GetTemplateByIdAsync_WithValidSystemTemplate_ReturnsTemplate()
    {
        // Arrange
        var groupId = "group1";
        var templateId = "template1";
        var userId = "user1";
        var group = new Group { Id = groupId, Name = "Test Group" };
        var member = new GroupMember { UserId = userId, Role = GroupRole.RegularUser };
        group.Members.Add(member);

        var template = new TaskTemplate
        {
            Id = templateId,
            Name = "System Template",
            IsSystemTemplate = true,
            DifficultyLevel = 5,
            DefaultFrequency = TaskFrequency.Weekly
        };

        _groupRepositoryMock.Setup(r => r.GetByIdAsync(groupId)).ReturnsAsync(group);
        _templateRepositoryMock.Setup(r => r.GetByIdWithDeleteCheckAsync(templateId)).ReturnsAsync(template);

        // Act
        var result = await _templateService.GetTemplateByIdAsync(groupId, templateId, userId);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("System Template");
    }

    [Fact]
    public async Task GetTemplateByIdAsync_WithGroupTemplateFromDifferentGroup_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var groupId = "group1";
        var templateId = "template1";
        var userId = "user1";
        var group = new Group { Id = groupId, Name = "Test Group" };
        var member = new GroupMember { UserId = userId, Role = GroupRole.RegularUser };
        group.Members.Add(member);

        var template = new TaskTemplate
        {
            Id = templateId,
            Name = "Other Group Template",
            IsSystemTemplate = false,
            GroupId = "othergroup",
            DifficultyLevel = 5,
            DefaultFrequency = TaskFrequency.Weekly
        };

        _groupRepositoryMock.Setup(r => r.GetByIdAsync(groupId)).ReturnsAsync(group);
        _templateRepositoryMock.Setup(r => r.GetByIdWithDeleteCheckAsync(templateId)).ReturnsAsync(template);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _templateService.GetTemplateByIdAsync(groupId, templateId, userId));
    }

    #endregion
}
