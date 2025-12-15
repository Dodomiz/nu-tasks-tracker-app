using System;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Features.Categories.Models;
using TasksTracker.Api.IntegrationTests.Infrastructure;
using Xunit;
using System.Collections.Generic;

namespace TasksTracker.Api.IntegrationTests.Categories;

public class CategoriesEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public CategoriesEndpointsTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetCategories_Returns_Ok()
    {
        var expected = new[]
        {
            new CategoryResponse { Id = "c1", GroupId = "g1", Name = "House", Icon = "home", Color = "orange-500", IsSystemCategory = true },
            new CategoryResponse { Id = "x1", GroupId = "g1", Name = "Custom", Icon = "truck", Color = "gray-700", IsSystemCategory = false },
        };
        _factory.CategoryServiceMock
            .Setup(s => s.GetCategoriesAsync("g1", It.IsAny<string>()))
            .ReturnsAsync([.. expected]);

        var client = _factory.CreateClient();
        var resp = await client.GetAsync("/api/Categories?groupId=g1");

        resp.StatusCode.Should().Be(HttpStatusCode.OK);
        var apiResp = await resp.Content.ReadFromJsonAsync<ApiResponse<CategoryResponse[]>>();
        apiResp!.Success.Should().BeTrue();
        apiResp.Data.Should().NotBeNull();
        apiResp.Data!.Length.Should().Be(2);
    }

    [Fact]
    public async Task GetCategory_NotFound_Returns_404()
    {
        _factory.CategoryServiceMock
            .Setup(s => s.GetCategoryAsync("nope", It.IsAny<string>()))
            .ThrowsAsync(new KeyNotFoundException());

        var client = _factory.CreateClient();
        var resp = await client.GetAsync("/api/Categories/nope");
        resp.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Create_Invalid_Model_Returns_400()
    {
        var client = _factory.CreateClient();
        // Missing required Name/Icon/Color -> model validation fails
        var resp = await client.PostAsJsonAsync("/api/Categories?groupId=g1", new { });
        resp.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Create_Success_Returns_201()
    {
        var request = new CreateCategoryRequest { Name = "Finance", Icon = "currency-dollar", Color = "emerald-600" };
        var created = new CategoryResponse { Id = "cid", GroupId = "g1", Name = request.Name, Icon = request.Icon, Color = request.Color };
        _factory.CategoryServiceMock
            .Setup(s => s.CreateCategoryAsync("g1", It.IsAny<CreateCategoryRequest>(), It.IsAny<string>()))
            .ReturnsAsync(created);

        var client = _factory.CreateClient();
        var resp = await client.PostAsJsonAsync("/api/Categories?groupId=g1", request);
        resp.StatusCode.Should().Be(HttpStatusCode.Created);
        var apiResp = await resp.Content.ReadFromJsonAsync<ApiResponse<CategoryResponse>>();
        apiResp!.Data!.Id.Should().Be("cid");
    }

    [Fact]
    public async Task Update_Validation_Error_Returns_400()
    {
        var client = _factory.CreateClient();
        // Invalid color format
        var resp = await client.PutAsJsonAsync("/api/Categories/c1", new UpdateCategoryRequest { Color = "invalid" });
        resp.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Delete_InUse_Returns_409()
    {
        _factory.CategoryServiceMock
            .Setup(s => s.DeleteCategoryAsync("c1", It.IsAny<string>()))
            .ThrowsAsync(new InvalidOperationException("in use"));

        var client = _factory.CreateClient();
        var resp = await client.DeleteAsync("/api/Categories/c1");
        resp.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }
}
