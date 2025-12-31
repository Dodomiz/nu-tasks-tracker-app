using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Core.Interfaces;
using TasksTracker.Api.Features.Tasks.Models;
using TasksTracker.Api.Features.Tasks.Services;
using TasksTracker.Api.Features.Notifications.Services;
using Xunit;

namespace TasksTracker.Api.Tests.Tasks;

public class ApprovalFeatureTests
{
    private readonly Mock<ITaskRepository> _taskRepo;
    private readonly Mock<IGroupRepository> _groupRepo;
    private readonly Mock<IUserRepository> _userRepo;
    private readonly Mock<ITaskHistoryRepository> _historyRepo;
    private readonly Mock<NotificationService> _notificationService;
    private readonly Mock<ILogger<TaskService>> _logger;
    private readonly TaskService _service;
    private readonly Group _testGroup;
    private readonly string _adminUserId = "507f1f77bcf86cd799439014";
    private readonly string _memberUserId = "507f1f77bcf86cd799439015";
    private readonly string _groupId = "507f1f77bcf86cd799439012";

    public ApprovalFeatureTests()
    {
        _taskRepo = new Mock<ITaskRepository>();
        _groupRepo = new Mock<IGroupRepository>();
        _userRepo = new Mock<IUserRepository>();
        _historyRepo = new Mock<ITaskHistoryRepository>();
        _notificationService = new Mock<NotificationService>();
        _logger = new Mock<ILogger<TaskService>>();
        
        _testGroup = new Group
        {
            Id = _groupId,
            Name = "Test Group",
            Members = new List<GroupMember>
            {
                new() { UserId = _adminUserId, Role = GroupRole.Admin, JoinedAt = DateTime.UtcNow },
                new() { UserId = _memberUserId, Role = GroupRole.RegularUser, JoinedAt = DateTime.UtcNow }
            }
        };
        
        _groupRepo.Setup(r => r.GetByIdAsync(_groupId)).ReturnsAsync(_testGroup);
        _groupRepo.Setup(r => r.UpdateAsync(It.IsAny<Group>())).ReturnsAsync(_testGroup);
        _historyRepo.Setup(r => r.CreateAsync(It.IsAny<TaskHistory>())).ReturnsAsync(new TaskHistory { Id = "historyId" });
        
        _service = new TaskService(_taskRepo.Object, _groupRepo.Object, _userRepo.Object, _historyRepo.Object, _notificationService.Object, _logger.Object);
    }

    [Fact]
    public async Task CreateAsync_AdminCanCreateApprovalRequiredTask()
    {
        // Arrange
        _taskRepo.Setup(r => r.CreateAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("taskId123");

        var request = new CreateTaskRequest
        {
            GroupId = _groupId,
            AssignedUserId = _memberUserId,
            Name = "Critical Task",
            Difficulty = 5,
            DueAt = DateTime.UtcNow.AddDays(1),
            Frequency = TaskFrequency.OneTime,
            RequiresApproval = true
        };

        // Act
        var taskId = await _service.CreateAsync(request, _adminUserId, true, CancellationToken.None);

        // Assert
        taskId.Should().Be("taskId123");
        _taskRepo.Verify(r => r.CreateAsync(
            It.Is<TaskItem>(t => t.RequiresApproval == true),
            It.IsAny<CancellationToken>()
        ), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_MemberCannotCreateApprovalRequiredTask()
    {
        // Arrange
        var request = new CreateTaskRequest
        {
            GroupId = _groupId,
            AssignedUserId = _memberUserId,
            Name = "Critical Task",
            Difficulty = 5,
            DueAt = DateTime.UtcNow.AddDays(1),
            Frequency = TaskFrequency.OneTime,
            RequiresApproval = true
        };

        // Act & Assert
        var act = async () => await _service.CreateAsync(request, _memberUserId, false, CancellationToken.None);
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Only group admins can create tasks*");
    }

    [Fact]
    public async Task UpdateTaskStatusAsync_MemberCanSetWaitingForApproval()
    {
        // Arrange
        var taskId = "taskId123";
        var task = new TaskItem
        {
            Id = taskId,
            GroupId = _groupId,
            AssignedUserId = _memberUserId,
            Name = "Test Task",
            Status = Core.Domain.TaskStatus.InProgress,
            RequiresApproval = true,
            Difficulty = 3,
            DueAt = DateTime.UtcNow.AddDays(1),
            CreatedByUserId = _adminUserId
        };

        _taskRepo.Setup(r => r.GetByIdAsync(taskId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(task);
        _taskRepo.Setup(r => r.UpdateAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await _service.UpdateTaskStatusAsync(taskId, Core.Domain.TaskStatus.WaitingForApproval, _memberUserId, CancellationToken.None);

        // Assert
        _taskRepo.Verify(r => r.UpdateAsync(
            It.Is<TaskItem>(t => t.Status == Core.Domain.TaskStatus.WaitingForApproval),
            It.IsAny<CancellationToken>()
        ), Times.Once);
    }

    [Fact]
    public async Task UpdateTaskStatusAsync_MemberCannotSetCompletedOnApprovalTask()
    {
        // Arrange
        var taskId = "taskId123";
        var task = new TaskItem
        {
            Id = taskId,
            GroupId = _groupId,
            AssignedUserId = _memberUserId,
            Name = "Test Task",
            Status = Core.Domain.TaskStatus.WaitingForApproval,
            RequiresApproval = true,
            Difficulty = 3,
            DueAt = DateTime.UtcNow.AddDays(1),
            CreatedByUserId = _adminUserId
        };

        _taskRepo.Setup(r => r.GetByIdAsync(taskId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(task);

        // Act & Assert
        var act = async () => await _service.UpdateTaskStatusAsync(
            taskId, 
            Core.Domain.TaskStatus.Completed, 
            _memberUserId, 
            CancellationToken.None
        );
        
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Only group admins can mark approval-required tasks as completed");
    }

    [Fact]
    public async Task UpdateTaskStatusAsync_AdminCanSetCompletedOnApprovalTask()
    {
        // Arrange
        var taskId = "taskId123";
        var task = new TaskItem
        {
            Id = taskId,
            GroupId = _groupId,
            AssignedUserId = _memberUserId,
            Name = "Test Task",
            Status = Core.Domain.TaskStatus.WaitingForApproval,
            RequiresApproval = true,
            Difficulty = 3,
            DueAt = DateTime.UtcNow.AddDays(1),
            CreatedByUserId = _adminUserId
        };

        _taskRepo.Setup(r => r.GetByIdAsync(taskId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(task);
        _taskRepo.Setup(r => r.UpdateAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await _service.UpdateTaskStatusAsync(taskId, Core.Domain.TaskStatus.Completed, _adminUserId, CancellationToken.None);

        // Assert
        _taskRepo.Verify(r => r.UpdateAsync(
            It.Is<TaskItem>(t => t.Status == Core.Domain.TaskStatus.Completed),
            It.IsAny<CancellationToken>()
        ), Times.Once);
    }

    [Fact]
    public async Task UpdateTaskAsync_TracksApprovalRequirementChange()
    {
        // Arrange
        var taskId = "taskId123";
        var task = new TaskItem
        {
            Id = taskId,
            GroupId = _groupId,
            AssignedUserId = _memberUserId,
            Name = "Test Task",
            Status = Core.Domain.TaskStatus.Pending,
            RequiresApproval = false,
            Difficulty = 3,
            DueAt = DateTime.UtcNow.AddDays(1),
            CreatedByUserId = _adminUserId
        };

        _taskRepo.Setup(r => r.GetByIdAsync(taskId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(task);
        _taskRepo.Setup(r => r.UpdateAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var updateRequest = new UpdateTaskRequest
        {
            RequiresApproval = true
        };

        // Act
        await _service.UpdateTaskAsync(taskId, updateRequest, _adminUserId, CancellationToken.None);

        // Assert
        _taskRepo.Verify(r => r.UpdateAsync(
            It.Is<TaskItem>(t => t.RequiresApproval == true),
            It.IsAny<CancellationToken>()
        ), Times.Once);
        
        _historyRepo.Verify(r => r.CreateAsync(
            It.Is<TaskHistory>(h => 
                h.Action == TaskHistoryAction.Updated &&
                h.Changes.ContainsKey("OldRequiresApproval") &&
                h.Changes.ContainsKey("NewRequiresApproval")
            )
        ), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_StandardTaskWithoutApproval_WorksAsExpected()
    {
        // Arrange
        _taskRepo.Setup(r => r.CreateAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("taskId123");

        var request = new CreateTaskRequest
        {
            GroupId = _groupId,
            AssignedUserId = _memberUserId,
            Name = "Regular Task",
            Difficulty = 3,
            DueAt = DateTime.UtcNow.AddDays(1),
            Frequency = TaskFrequency.OneTime,
            RequiresApproval = false // Standard task
        };

        // Act
        var taskId = await _service.CreateAsync(request, _adminUserId, true, CancellationToken.None);

        // Assert
        taskId.Should().Be("taskId123");
        _taskRepo.Verify(r => r.CreateAsync(
            It.Is<TaskItem>(t => t.RequiresApproval == false),
            It.IsAny<CancellationToken>()
        ), Times.Once);
    }

    [Fact]
    public async Task UpdateTaskStatusAsync_StandardTaskCompletion_StillWorksForMembers()
    {
        // Arrange - Standard task (no approval required)
        var taskId = "taskId123";
        var task = new TaskItem
        {
            Id = taskId,
            GroupId = _groupId,
            AssignedUserId = _memberUserId,
            Name = "Standard Task",
            Status = Core.Domain.TaskStatus.InProgress,
            RequiresApproval = false, // Standard task
            Difficulty = 3,
            DueAt = DateTime.UtcNow.AddDays(1),
            CreatedByUserId = _adminUserId
        };

        _taskRepo.Setup(r => r.GetByIdAsync(taskId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(task);
        _taskRepo.Setup(r => r.UpdateAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act - Member completes their own standard task
        await _service.UpdateTaskStatusAsync(taskId, Core.Domain.TaskStatus.Completed, _memberUserId, CancellationToken.None);

        // Assert - Should succeed (regression test - existing functionality preserved)
        _taskRepo.Verify(r => r.UpdateAsync(
            It.Is<TaskItem>(t => t.Status == Core.Domain.TaskStatus.Completed),
            It.IsAny<CancellationToken>()
        ), Times.Once);
    }
}
