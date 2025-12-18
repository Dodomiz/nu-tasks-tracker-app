using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Core.Interfaces;
using TasksTracker.Api.Features.Groups.Models;
using TasksTracker.Api.Features.Groups.Services;
using Xunit;

namespace TasksTracker.Api.Tests.Groups;

public class GroupServiceTests
{
    private readonly Mock<IGroupRepository> _groupRepo = new();
    private readonly Mock<IUserRepository> _userRepo = new();
    private readonly Mock<ILogger<GroupService>> _logger = new();

    private GroupService CreateSut() => new(_groupRepo.Object, _userRepo.Object, _logger.Object);

    [Fact]
    public async Task CreateGroupAsync_ValidRequest_CreatesAndReturnsResponse()
    {
        // Arrange
        var userId = "user-1";
        var request = new CreateGroupRequest
        {
            Name = "My Group",
            Description = "Desc",
            Category = "work"
        };

        Group? captured = null;
        _groupRepo
            .Setup(r => r.CreateAsync(It.IsAny<Group>()))
            .ReturnsAsync((Group g) => { captured = g; g.Id = "grp-123"; return g; });

        var sut = CreateSut();

        // Act
        var result = await sut.CreateGroupAsync(request, userId);

        // Assert
        captured.Should().NotBeNull();
        captured!.Name.Should().Be(request.Name);
        captured.CreatedBy.Should().Be(userId);
        captured.Members.Should().ContainSingle(m => m.UserId == userId && m.Role == GroupRole.Admin);
        captured.InvitationCode.Should().NotBeNullOrEmpty();

        result.Id.Should().Be("grp-123");
        result.Name.Should().Be(request.Name);
        result.MyRole.Should().Be("Admin");
    }

    [Theory]
    [InlineData("ab")]
    [InlineData("")]
    [InlineData("this-name-is-way-too-long-to-be-accepted-because-it-exceeds-fifty-characters")]
    public async Task CreateGroupAsync_InvalidName_Throws(string badName)
    {
        var sut = CreateSut();
        var request = new CreateGroupRequest { Name = badName, Description = "", Category = "home" };

        var act = async () => await sut.CreateGroupAsync(request, "user-1");

        await act.Should().ThrowAsync<ArgumentException>();
    }

    [Fact]
    public async Task GetGroupAsync_NotMember_ThrowsUnauthorized()
    {
        var group = new Group
        {
            Id = "g1",
            Name = "G1",
            Members = new List<GroupMember> { new() { UserId = "other", Role = GroupRole.RegularUser } }
        };
        _groupRepo.Setup(r => r.GetByIdAsync("g1")).ReturnsAsync(group);
        var sut = CreateSut();

        var act = async () => await sut.GetGroupAsync("g1", "user-1");

        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task UpdateGroupAsync_NonAdmin_ThrowsUnauthorized()
    {
        var group = new Group
        {
            Id = "g1",
            Name = "G1",
            Members = new List<GroupMember> { new() { UserId = "user-1", Role = GroupRole.RegularUser } }
        };
        _groupRepo.Setup(r => r.GetByIdAsync("g1")).ReturnsAsync(group);
        var sut = CreateSut();

        var act = async () => await sut.UpdateGroupAsync("g1", new UpdateGroupRequest { Name = "New", Description = "", Category = "personal" }, "user-1");

        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task DeleteGroupAsync_Admin_Deletes()
    {
        var group = new Group
        {
            Id = "g1",
            Name = "G1",
            Members = new List<GroupMember> { new() { UserId = "admin", Role = GroupRole.Admin } }
        };
        _groupRepo.Setup(r => r.GetByIdAsync("g1")).ReturnsAsync(group);
        _groupRepo.Setup(r => r.DeleteAsync("g1")).ReturnsAsync(true);
        var sut = CreateSut();

        await sut.DeleteGroupAsync("g1", "admin");

        _groupRepo.Verify(r => r.DeleteAsync("g1"), Times.Once);
    }
}
