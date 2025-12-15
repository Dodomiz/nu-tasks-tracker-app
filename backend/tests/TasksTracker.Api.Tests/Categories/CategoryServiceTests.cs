using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Core.Interfaces;
using TasksTracker.Api.Features.Categories.Models;
using TasksTracker.Api.Features.Categories.Services;
using Microsoft.Extensions.Logging;
using Xunit;

namespace TasksTracker.Api.Tests.Categories;

public class CategoryServiceTests
{
    private readonly Mock<ICategoryRepository> _categoryRepo = new();
    private readonly Mock<IGroupRepository> _groupRepo = new();
    private readonly Mock<ILogger<CategoryService>> _logger = new();

    private CategoryService CreateSut() => new(_categoryRepo.Object, _groupRepo.Object, _logger.Object);

    private static Group MakeGroup(string groupId, string userId, string role)
    {
        return new Group
        {
            Id = groupId,
            Members = new List<GroupMember>
            {
                new() { UserId = userId, Role = role }
            }
        };
    }

    [Fact]
    public async Task GetCategoriesAsync_Returns_System_And_Custom_For_Member()
    {
        var groupId = "g1";
        var userId = "u1";
        _groupRepo.Setup(r => r.GetByIdAsync(groupId)).ReturnsAsync(MakeGroup(groupId, userId, GroupRole.RegularUser));
        _categoryRepo.Setup(r => r.GetByGroupAsync(groupId)).ReturnsAsync(new List<Category>
        {
            new Category { Id = "c1", GroupId = groupId, Name = "CustomA", Icon = "home", Color = "blue-500" },
            new Category { Id = "c2", GroupId = groupId, Name = "CustomB", Icon = "truck", Color = "gray-700" }
        });
        _categoryRepo.Setup(r => r.GetTaskCountAsync(It.IsAny<string>())).ReturnsAsync(0);

        var sut = CreateSut();
        var result = await sut.GetCategoriesAsync(groupId, userId);

        result.Should().NotBeNull();
        result.Should().Contain(c => c.IsSystemCategory);
        result.Should().Contain(c => !c.IsSystemCategory && c.Id == "c1");
        result.Should().Contain(c => !c.IsSystemCategory && c.Id == "c2");
    }

    [Fact]
    public async Task GetCategoriesAsync_Throws_When_Not_Member()
    {
        var groupId = "g1";
        var userId = "u1";
        _groupRepo.Setup(r => r.GetByIdAsync(groupId)).ReturnsAsync(new Group { Id = groupId, Members = new List<GroupMember>() });

        var sut = CreateSut();
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => sut.GetCategoriesAsync(groupId, userId));
    }

    [Fact]
    public async Task CreateCategoryAsync_Allows_Admin_And_Ensures_Unique_Name()
    {
        var groupId = "g1";
        var adminId = "admin1";
        var req = new CreateCategoryRequest { Name = "Finance", Icon = "currency-dollar", Color = "emerald-600" };
        _groupRepo.Setup(r => r.GetByIdAsync(groupId)).ReturnsAsync(MakeGroup(groupId, adminId, GroupRole.Admin));
        _categoryRepo.Setup(r => r.NameExistsInGroupAsync(groupId, req.Name, null)).ReturnsAsync(false);
        _categoryRepo.Setup(r => r.CreateAsync(It.IsAny<Category>())).ReturnsAsync((Category c) => { c.Id = "newId"; return c; });

        var sut = CreateSut();
        var created = await sut.CreateCategoryAsync(groupId, req, adminId);

        created.Id.Should().Be("newId");
        created.Name.Should().Be(req.Name);
        _categoryRepo.Verify(r => r.CreateAsync(It.Is<Category>(c => c.GroupId == groupId && c.Name == req.Name)), Times.Once);
    }

    [Fact]
    public async Task CreateCategoryAsync_Rejects_Non_Admin()
    {
        var groupId = "g1";
        var userId = "u1";
        var req = new CreateCategoryRequest { Name = "Health", Icon = "heart", Color = "red-500" };
        _groupRepo.Setup(r => r.GetByIdAsync(groupId)).ReturnsAsync(MakeGroup(groupId, userId, GroupRole.RegularUser));

        var sut = CreateSut();
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => sut.CreateCategoryAsync(groupId, req, userId));
    }

    [Fact]
    public async Task UpdateCategoryAsync_Enforces_Uniqueness_And_Admin()
    {
        var category = new Category { Id = "c1", GroupId = "g1", Name = "Old", Icon = "home", Color = "blue-500", IsSystemCategory = false };
        _categoryRepo.Setup(r => r.GetByIdAsync("c1")).ReturnsAsync(category);
        _groupRepo.Setup(r => r.GetByIdAsync("g1")).ReturnsAsync(MakeGroup("g1", "admin1", GroupRole.Admin));
        _categoryRepo.Setup(r => r.NameExistsInGroupAsync("g1", "NewName", "c1")).ReturnsAsync(false);
        _categoryRepo.Setup(r => r.UpdateAsync(It.IsAny<Category>())).ReturnsAsync((Category c) => c);
        _categoryRepo.Setup(r => r.GetTaskCountAsync("c1")).ReturnsAsync(3);

        var sut = CreateSut();
        var updated = await sut.UpdateCategoryAsync("c1", new UpdateCategoryRequest { Name = "NewName" }, "admin1");

        updated.Name.Should().Be("NewName");
        updated.TaskCount.Should().Be(3);
    }

    [Fact]
    public async Task UpdateCategoryAsync_Rejects_System_Category()
    {
        var category = new Category { Id = "c1", GroupId = "g1", Name = "House", IsSystemCategory = true };
        _categoryRepo.Setup(r => r.GetByIdAsync("c1")).ReturnsAsync(category);
        _groupRepo.Setup(r => r.GetByIdAsync("g1")).ReturnsAsync(MakeGroup("g1", "admin1", GroupRole.Admin));

        var sut = CreateSut();
        await Assert.ThrowsAsync<InvalidOperationException>(() => sut.UpdateCategoryAsync("c1", new UpdateCategoryRequest { Name = "X" }, "admin1"));
    }

    [Fact]
    public async Task DeleteCategoryAsync_Blocks_When_Tasks_Assigned()
    {
        var category = new Category { Id = "c1", GroupId = "g1", Name = "Finance", IsSystemCategory = false };
        _categoryRepo.Setup(r => r.GetByIdAsync("c1")).ReturnsAsync(category);
        _groupRepo.Setup(r => r.GetByIdAsync("g1")).ReturnsAsync(MakeGroup("g1", "admin1", GroupRole.Admin));
        _categoryRepo.Setup(r => r.GetTaskCountAsync("c1")).ReturnsAsync(2);

        var sut = CreateSut();
        await Assert.ThrowsAsync<InvalidOperationException>(() => sut.DeleteCategoryAsync("c1", "admin1"));
    }

    [Fact]
    public async Task DeleteCategoryAsync_Allows_When_No_Tasks()
    {
        var category = new Category { Id = "c1", GroupId = "g1", Name = "Finance", IsSystemCategory = false };
        _categoryRepo.Setup(r => r.GetByIdAsync("c1")).ReturnsAsync(category);
        _groupRepo.Setup(r => r.GetByIdAsync("g1")).ReturnsAsync(MakeGroup("g1", "admin1", GroupRole.Admin));
        _categoryRepo.Setup(r => r.GetTaskCountAsync("c1")).ReturnsAsync(0);
        _categoryRepo.Setup(r => r.DeleteAsync("c1")).ReturnsAsync(true);

        var sut = CreateSut();
        await sut.DeleteCategoryAsync("c1", "admin1");
        _categoryRepo.Verify(r => r.DeleteAsync("c1"), Times.Once);
    }
}
