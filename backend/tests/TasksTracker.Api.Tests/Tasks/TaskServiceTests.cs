using System;
using System.Threading;
using FluentAssertions;
using Moq;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Core.Interfaces;
using TasksTracker.Api.Features.Tasks.Models;
using TasksTracker.Api.Features.Tasks.Services;

namespace TasksTracker.Api.Tests.Tasks;

public class TaskServiceTests
{
    [Fact]
    public async System.Threading.Tasks.Task CreateAsync_Admin_Succeeds()
    {
        var repo = new Mock<ITaskRepository>();
        repo.Setup(r => r.CreateAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("507f1f77bcf86cd799439011");

        var service = new TaskService(repo.Object);
        var request = new CreateTaskRequest
        {
            GroupId = "507f1f77bcf86cd799439012",
            AssignedUserId = "507f1f77bcf86cd799439013",
            Name = "Do dishes",
            Difficulty = 3,
            DueAt = DateTime.UtcNow.AddDays(1),
            Frequency = TaskFrequency.OneTime
        };

        var id = await service.CreateAsync(request, "507f1f77bcf86cd799439014", true, CancellationToken.None);
        id.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async System.Threading.Tasks.Task CreateAsync_NonAdmin_Throws()
    {
        var repo = new Mock<ITaskRepository>();
        var service = new TaskService(repo.Object);
        var request = new CreateTaskRequest
        {
            GroupId = "507f1f77bcf86cd799439012",
            AssignedUserId = "507f1f77bcf86cd799439013",
            Name = "Do dishes",
            Difficulty = 3,
            DueAt = DateTime.UtcNow.AddDays(1),
            Frequency = TaskFrequency.OneTime
        };

        var act = async () => await service.CreateAsync(request, "507f1f77bcf86cd799439014", false, CancellationToken.None);
        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(11)]
    public async System.Threading.Tasks.Task CreateAsync_InvalidDifficulty_Throws(int difficulty)
    {
        var repo = new Mock<ITaskRepository>();
        var service = new TaskService(repo.Object);
        var request = new CreateTaskRequest
        {
            GroupId = "507f1f77bcf86cd799439012",
            AssignedUserId = "507f1f77bcf86cd799439013",
            Name = "Do dishes",
            Difficulty = difficulty,
            DueAt = DateTime.UtcNow.AddDays(1),
            Frequency = TaskFrequency.OneTime
        };

        var act = async () => await service.CreateAsync(request, "507f1f77bcf86cd799439014", true, CancellationToken.None);
        await act.Should().ThrowAsync<ArgumentException>();
    }
}