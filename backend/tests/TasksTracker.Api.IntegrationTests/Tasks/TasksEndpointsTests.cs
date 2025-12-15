using System.Net;
using System.Net.Http.Json;
using System;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using TasksTracker.Api.Features.Tasks.Models;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.IntegrationTests.Infrastructure;

namespace TasksTracker.Api.IntegrationTests.Tasks;

public class TasksEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public TasksEndpointsTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async System.Threading.Tasks.Task Post_CreateTask_Admin_ReturnsCreated()
    {
        var client = _factory.CreateClient();
        var request = new CreateTaskRequest
        {
            GroupId = "507f1f77bcf86cd799439012",
            AssignedUserId = "507f1f77bcf86cd799439013",
            Name = "Take out trash",
            Difficulty = 2,
            DueAt = DateTime.UtcNow.AddDays(1),
            Frequency = TaskFrequency.OneTime
        };

        var resp = await client.PostAsJsonAsync("/api/tasks", request);
        resp.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    [Fact]
    public async System.Threading.Tasks.Task Post_CreateTask_MissingName_ReturnsBadRequest()
    {
        var client = _factory.CreateClient();
        var request = new CreateTaskRequest
        {
            GroupId = "507f1f77bcf86cd799439012",
            AssignedUserId = "507f1f77bcf86cd799439013",
            Name = "",
            Difficulty = 2,
            DueAt = DateTime.UtcNow.AddDays(1),
            Frequency = TaskFrequency.OneTime
        };

        var resp = await client.PostAsJsonAsync("/api/tasks", request);
        resp.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}