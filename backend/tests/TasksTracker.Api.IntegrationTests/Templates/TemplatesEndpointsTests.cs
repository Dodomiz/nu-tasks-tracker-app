using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Features.Templates.Models;
using TasksTracker.Api.IntegrationTests.Infrastructure;

namespace TasksTracker.Api.IntegrationTests.Templates;

public class TemplatesEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public TemplatesEndpointsTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private HttpClient CreateAuthedClient()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "test");
        return client;
    }

    #region GET /api/groups/{groupId}/templates

    [Fact]
    public async Task GetTemplates_ReturnsOk_WithTemplates()
    {
        // Arrange
        var groupId = "group1";
        var templates = new List<TemplateResponse>
        {
            new()
            {
                Id = "1",
                Name = "System Template",
                IsSystemTemplate = true,
                DifficultyLevel = 5,
                DefaultFrequency = TaskFrequency.Weekly
            },
            new()
            {
                Id = "2",
                Name = "Group Template",
                IsSystemTemplate = false,
                GroupId = groupId,
                DifficultyLevel = 3,
                DefaultFrequency = TaskFrequency.Daily
            }
        };

        _factory.TemplateServiceMock
            .Setup(s => s.GetTemplatesAsync(groupId, It.IsAny<string>(), It.IsAny<GetTemplatesQuery>()))
            .ReturnsAsync(templates);

        var client = CreateAuthedClient();

        // Act
        var response = await client.GetAsync($"/api/groups/{groupId}/templates");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiEnvelope<List<TemplateResponse>>>();
        result!.data.Should().NotBeNull();
        result.data!.Should().HaveCount(2);
        result.data![0].Name.Should().Be("System Template");
        result.data![1].Name.Should().Be("Group Template");
    }

    [Fact]
    public async Task GetTemplates_WithFilters_PassesFiltersToService()
    {
        // Arrange
        var groupId = "group1";
        var categoryId = "cat1";
        var templates = new List<TemplateResponse>();

        _factory.TemplateServiceMock
            .Setup(s => s.GetTemplatesAsync(groupId, It.IsAny<string>(), It.IsAny<GetTemplatesQuery>()))
            .ReturnsAsync(templates);

        var client = CreateAuthedClient();

        // Act
        var response = await client.GetAsync(
            $"/api/groups/{groupId}/templates?categoryId={categoryId}&difficultyMin=3&difficultyMax=7&frequency={TaskFrequency.Weekly}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        _factory.TemplateServiceMock.Verify(
            s => s.GetTemplatesAsync(groupId, It.IsAny<string>(), 
                It.Is<GetTemplatesQuery>(q => 
                    q.CategoryId == categoryId && 
                    q.DifficultyMin == 3 && 
                    q.DifficultyMax == 7 && 
                    q.Frequency == TaskFrequency.Weekly)),
            Times.Once);
    }

    [Fact]
    public async Task GetTemplates_WhenUnauthorized_ReturnsUnauthorized()
    {
        // Arrange
        var groupId = "group1";
        _factory.TemplateServiceMock
            .Setup(s => s.GetTemplatesAsync(groupId, It.IsAny<string>(), It.IsAny<GetTemplatesQuery>()))
            .ThrowsAsync(new UnauthorizedAccessException());

        var client = CreateAuthedClient();

        // Act
        var response = await client.GetAsync($"/api/groups/{groupId}/templates");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    #endregion

    #region GET /api/groups/{groupId}/templates/{id}

    [Fact]
    public async Task GetTemplateById_ReturnsOk_WithTemplate()
    {
        // Arrange
        var groupId = "group1";
        var templateId = "template1";
        var template = new TemplateResponse
        {
            Id = templateId,
            Name = "Test Template",
            DifficultyLevel = 5,
            IsSystemTemplate = false,
            GroupId = groupId,
            DefaultFrequency = TaskFrequency.Weekly
        };

        _factory.TemplateServiceMock
            .Setup(s => s.GetTemplateByIdAsync(groupId, templateId, It.IsAny<string>()))
            .ReturnsAsync(template);

        var client = CreateAuthedClient();

        // Act
        var response = await client.GetAsync($"/api/groups/{groupId}/templates/{templateId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiEnvelope<TemplateResponse>>();
        result!.data.Should().NotBeNull();
        result.data!.Name.Should().Be("Test Template");
    }

    [Fact]
    public async Task GetTemplateById_WhenNotFound_ReturnsNotFound()
    {
        // Arrange
        var groupId = "group1";
        var templateId = "nonexistent";

        _factory.TemplateServiceMock
            .Setup(s => s.GetTemplateByIdAsync(groupId, templateId, It.IsAny<string>()))
            .ThrowsAsync(new KeyNotFoundException());

        var client = CreateAuthedClient();

        // Act
        var response = await client.GetAsync($"/api/groups/{groupId}/templates/{templateId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    #endregion

    #region POST /api/groups/{groupId}/templates

    [Fact]
    public async Task CreateTemplate_WithValidData_ReturnsCreated()
    {
        // Arrange
        var groupId = "group1";
        var request = new CreateTemplateRequest
        {
            Name = "New Template",
            Description = "Test description",
            DifficultyLevel = 5,
            EstimatedDurationMinutes = 30,
            DefaultFrequency = TaskFrequency.Weekly
        };

        var createdTemplate = new TemplateResponse
        {
            Id = "new-template",
            Name = request.Name,
            Description = request.Description,
            DifficultyLevel = request.DifficultyLevel,
            EstimatedDurationMinutes = request.EstimatedDurationMinutes,
            DefaultFrequency = request.DefaultFrequency,
            IsSystemTemplate = false,
            GroupId = groupId
        };

        _factory.TemplateServiceMock
            .Setup(s => s.CreateTemplateAsync(groupId, It.IsAny<CreateTemplateRequest>(), It.IsAny<string>()))
            .ReturnsAsync(createdTemplate);

        var client = CreateAuthedClient();

        // Act
        var response = await client.PostAsJsonAsync($"/api/groups/{groupId}/templates", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var result = await response.Content.ReadFromJsonAsync<ApiEnvelope<TemplateResponse>>();
        result!.data.Should().NotBeNull();
        result.data!.Name.Should().Be("New Template");
        response.Headers.Location.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateTemplate_WhenUnauthorized_ReturnsForbidden()
    {
        // Arrange
        var groupId = "group1";
        var request = new CreateTemplateRequest
        {
            Name = "New Template",
            DifficultyLevel = 5,
            DefaultFrequency = TaskFrequency.Weekly
        };

        _factory.TemplateServiceMock
            .Setup(s => s.CreateTemplateAsync(groupId, It.IsAny<CreateTemplateRequest>(), It.IsAny<string>()))
            .ThrowsAsync(new UnauthorizedAccessException());

        var client = CreateAuthedClient();

        // Act
        var response = await client.PostAsJsonAsync($"/api/groups/{groupId}/templates", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task CreateTemplate_WithDuplicateName_ReturnsBadRequest()
    {
        // Arrange
        var groupId = "group1";
        var request = new CreateTemplateRequest
        {
            Name = "Duplicate Name",
            DifficultyLevel = 5,
            DefaultFrequency = TaskFrequency.Weekly
        };

        _factory.TemplateServiceMock
            .Setup(s => s.CreateTemplateAsync(groupId, It.IsAny<CreateTemplateRequest>(), It.IsAny<string>()))
            .ThrowsAsync(new ArgumentException("Template name already exists"));

        var client = CreateAuthedClient();

        // Act
        var response = await client.PostAsJsonAsync($"/api/groups/{groupId}/templates", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    #endregion

    #region PUT /api/groups/{groupId}/templates/{id}

    [Fact]
    public async Task UpdateTemplate_WithValidData_ReturnsOk()
    {
        // Arrange
        var groupId = "group1";
        var templateId = "template1";
        var request = new UpdateTemplateRequest
        {
            Name = "Updated Name",
            DifficultyLevel = 7,
            DefaultFrequency = TaskFrequency.Daily
        };

        var updatedTemplate = new TemplateResponse
        {
            Id = templateId,
            Name = request.Name,
            DifficultyLevel = request.DifficultyLevel,
            DefaultFrequency = request.DefaultFrequency,
            IsSystemTemplate = false,
            GroupId = groupId
        };

        _factory.TemplateServiceMock
            .Setup(s => s.UpdateTemplateAsync(groupId, templateId, It.IsAny<UpdateTemplateRequest>(), It.IsAny<string>()))
            .ReturnsAsync(updatedTemplate);

        var client = CreateAuthedClient();

        // Act
        var response = await client.PutAsJsonAsync($"/api/groups/{groupId}/templates/{templateId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<ApiEnvelope<TemplateResponse>>();
        result!.data.Should().NotBeNull();
        result.data!.Name.Should().Be("Updated Name");
    }

    [Fact]
    public async Task UpdateTemplate_WhenSystemTemplate_ReturnsForbidden()
    {
        // Arrange
        var groupId = "group1";
        var templateId = "system-template";
        var request = new UpdateTemplateRequest
        {
            Name = "Updated Name",
            DifficultyLevel = 7,
            DefaultFrequency = TaskFrequency.Daily
        };

        _factory.TemplateServiceMock
            .Setup(s => s.UpdateTemplateAsync(groupId, templateId, It.IsAny<UpdateTemplateRequest>(), It.IsAny<string>()))
            .ThrowsAsync(new UnauthorizedAccessException("Template does not belong to this group"));

        var client = CreateAuthedClient();

        // Act
        var response = await client.PutAsJsonAsync($"/api/groups/{groupId}/templates/{templateId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    #endregion

    #region DELETE /api/groups/{groupId}/templates/{id}

    [Fact]
    public async Task DeleteTemplate_WithValidTemplate_ReturnsNoContent()
    {
        // Arrange
        var groupId = "group1";
        var templateId = "template1";

        _factory.TemplateServiceMock
            .Setup(s => s.DeleteTemplateAsync(groupId, templateId, It.IsAny<string>()))
            .Returns(Task.CompletedTask);

        var client = CreateAuthedClient();

        // Act
        var response = await client.DeleteAsync($"/api/groups/{groupId}/templates/{templateId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task DeleteTemplate_WhenSystemTemplate_ReturnsForbidden()
    {
        // Arrange
        var groupId = "group1";
        var templateId = "system-template";

        _factory.TemplateServiceMock
            .Setup(s => s.DeleteTemplateAsync(groupId, templateId, It.IsAny<string>()))
            .ThrowsAsync(new UnauthorizedAccessException("Template does not belong to this group"));

        var client = CreateAuthedClient();

        // Act
        var response = await client.DeleteAsync($"/api/groups/{groupId}/templates/{templateId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task DeleteTemplate_WhenNotFound_ReturnsNotFound()
    {
        // Arrange
        var groupId = "group1";
        var templateId = "nonexistent";

        _factory.TemplateServiceMock
            .Setup(s => s.DeleteTemplateAsync(groupId, templateId, It.IsAny<string>()))
            .ThrowsAsync(new KeyNotFoundException());

        var client = CreateAuthedClient();

        // Act
        var response = await client.DeleteAsync($"/api/groups/{groupId}/templates/{templateId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    #endregion

    private sealed class ApiEnvelope<T>
    {
        public T? data { get; set; }
        public string? errorCode { get; set; }
        public string? message { get; set; }
    }
}
