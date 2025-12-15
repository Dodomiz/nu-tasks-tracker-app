using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Core.Interfaces;
using TasksTracker.Api.Features.Groups.Services;
using Xunit;

namespace TasksTracker.Api.Tests.Groups;

public class InvitationServiceTests
{
    private readonly Mock<IGroupRepository> _groupRepo = new();
    private readonly Mock<IUserRepository> _userRepo = new();
    private readonly Mock<ILogger<InvitationService>> _logger = new();

    private InvitationService CreateSut(string frontendUrl = "http://localhost:5173")
    {
        var dict = new Dictionary<string, string?> { ["App:FrontendUrl"] = frontendUrl };
        var config = new ConfigurationBuilder().AddInMemoryCollection(dict!).Build();
        return new InvitationService(_groupRepo.Object, _userRepo.Object, config, _logger.Object);
    }

    [Fact]
    public async Task ValidateInvitationCodeAsync_ReturnsTrue_WhenGroupExists()
    {
        _groupRepo.Setup(r => r.GetByInvitationCodeAsync("code-1")).ReturnsAsync(new Group { Id = "g1", InvitationCode = "code-1" });
        var sut = CreateSut();

        var ok = await sut.ValidateInvitationCodeAsync("code-1");

        ok.Should().BeTrue();
    }

    [Fact]
    public async Task SendInvitationAsync_BuildsUrl_UsingConfiguredFrontend()
    {
        _userRepo.Setup(r => r.GetByIdAsync("inviter")).ReturnsAsync(new User { FirstName = "Jane", LastName = "Doe" });
        var sut = CreateSut("https://app.example.com");

        var resp = await sut.SendInvitationAsync("to@example.com", "Group A", "abc-123", "inviter");

        resp.InvitationUrl.Should().Be("https://app.example.com/groups/join/abc-123");
        resp.Message.Should().Contain("to@example.com");
    }
}
