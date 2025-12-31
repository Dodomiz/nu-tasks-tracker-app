using System;
using System.Collections.Generic;
using System.Threading;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Core.Interfaces;
using TasksTracker.Api.Features.Tasks.Models;
using TasksTracker.Api.Features.Tasks.Services;
using TasksTracker.Api.Features.Notifications.Services;

namespace TasksTracker.Api.Tests.Tasks;

public class TaskServiceTests
{
    [Fact]
    public async System.Threading.Tasks.Task CreateAsync_Admin_Succeeds()
    {
        var currentUserId = "507f1f77bcf86cd799439014";
        var assignedUserId = "507f1f77bcf86cd799439013";
        var groupId = "507f1f77bcf86cd799439012";
        
        var group = new Group
        {
            Id = groupId,
            Name = "Test Group",
            Members = new List<GroupMember>
            {
                new() { UserId = currentUserId, Role = GroupRole.Admin, JoinedAt = DateTime.UtcNow },
                new() { UserId = assignedUserId, Role = GroupRole.RegularUser, JoinedAt = DateTime.UtcNow }
            }
        };
        
        var taskRepo = new Mock<ITaskRepository>();
        taskRepo.Setup(r => r.CreateAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("507f1f77bcf86cd799439011");
            
        var groupRepo = new Mock<IGroupRepository>();
        groupRepo.Setup(r => r.GetByIdAsync(groupId))
            .ReturnsAsync(group);
        groupRepo.Setup(r => r.UpdateAsync(It.IsAny<Group>()))
            .ReturnsAsync(group);
            
        var userRepo = new Mock<IUserRepository>();
        var historyRepo = new Mock<ITaskHistoryRepository>();
        historyRepo.Setup(r => r.CreateAsync(It.IsAny<TaskHistory>())).ReturnsAsync(new TaskHistory { Id = "historyId" });
        var notificationService = new Mock<NotificationService>();
        var logger = new Mock<ILogger<TaskService>>();

        var service = new TaskService(taskRepo.Object, groupRepo.Object, userRepo.Object, historyRepo.Object, notificationService.Object, logger.Object);
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
        var currentUserId = "507f1f77bcf86cd799439014";
        var assignedUserId = "507f1f77bcf86cd799439013";
        var groupId = "507f1f77bcf86cd799439012";
        
        var group = new Group
        {
            Id = groupId,
            Name = "Test Group",
            Members = new List<GroupMember>
            {
                new() { UserId = currentUserId, Role = GroupRole.RegularUser, JoinedAt = DateTime.UtcNow },
                new() { UserId = assignedUserId, Role = GroupRole.RegularUser, JoinedAt = DateTime.UtcNow }
            }
        };
        
        var taskRepo = new Mock<ITaskRepository>();
        var groupRepo = new Mock<IGroupRepository>();
        groupRepo.Setup(r => r.GetByIdAsync(groupId))
            .ReturnsAsync(group);
        var userRepo = new Mock<IUserRepository>();
        var historyRepo = new Mock<ITaskHistoryRepository>();
        historyRepo.Setup(r => r.CreateAsync(It.IsAny<TaskHistory>())).ReturnsAsync(new TaskHistory { Id = "historyId" });
        var notificationService = new Mock<NotificationService>();
        var logger = new Mock<ILogger<TaskService>>();
        
        var service = new TaskService(taskRepo.Object, groupRepo.Object, userRepo.Object, historyRepo.Object, notificationService.Object, logger.Object);
        var request = new CreateTaskRequest
        {
            GroupId = groupId,
            AssignedUserId = assignedUserId,
            Name = "Do dishes",
            Difficulty = 3,
            DueAt = DateTime.UtcNow.AddDays(1),
            Frequency = TaskFrequency.OneTime
        };

        var act = async () => await service.CreateAsync(request, currentUserId, false, CancellationToken.None);
        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(11)]
    public async System.Threading.Tasks.Task CreateAsync_InvalidDifficulty_Throws(int difficulty)
    {
        var currentUserId = "507f1f77bcf86cd799439014";
        var assignedUserId = "507f1f77bcf86cd799439013";
        var groupId = "507f1f77bcf86cd799439012";
        
        var group = new Group
        {
            Id = groupId,
            Name = "Test Group",
            Members = new List<GroupMember>
            {
                new() { UserId = currentUserId, Role = GroupRole.Admin, JoinedAt = DateTime.UtcNow },
                new() { UserId = assignedUserId, Role = GroupRole.RegularUser, JoinedAt = DateTime.UtcNow }
            }
        };
        
        var taskRepo = new Mock<ITaskRepository>();
        var groupRepo = new Mock<IGroupRepository>();
        groupRepo.Setup(r => r.GetByIdAsync(groupId))
            .ReturnsAsync(group);
        var userRepo = new Mock<IUserRepository>();
        var historyRepo = new Mock<ITaskHistoryRepository>();
        historyRepo.Setup(r => r.CreateAsync(It.IsAny<TaskHistory>())).ReturnsAsync(new TaskHistory { Id = "historyId" });
        var notificationService = new Mock<NotificationService>();
        var logger = new Mock<ILogger<TaskService>>();
        
        var service = new TaskService(taskRepo.Object, groupRepo.Object, userRepo.Object, historyRepo.Object, notificationService.Object, logger.Object);
        var request = new CreateTaskRequest
        {
            GroupId = groupId,
            AssignedUserId = assignedUserId,
            Name = "Do dishes",
            Difficulty = difficulty,
            DueAt = DateTime.UtcNow.AddDays(1),
            Frequency = TaskFrequency.OneTime
        };

        var act = async () => await service.CreateAsync(request, "507f1f77bcf86cd799439014", true, CancellationToken.None);
        await act.Should().ThrowAsync<ArgumentException>();
    }
}