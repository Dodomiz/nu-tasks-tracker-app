using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Collections.Generic;
using Moq;
using TasksTracker.Api.Features.Groups.Models;
using TasksTracker.Api.IntegrationTests.Infrastructure;

namespace TasksTracker.Api.IntegrationTests.Groups;

public class GroupsEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public GroupsEndpointsTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private HttpClient CreateAuthedClient()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "test");
        return client;
    }

    [Fact]
    public async Task GetMyGroups_ReturnsOk_WithMockedEmptyList()
    {
        _factory.GroupServiceMock
            .Setup(s => s.GetUserGroupsAsync(It.IsAny<string>(), It.IsAny<int>(), It.IsAny<int>()))
            .ReturnsAsync(new GroupsResponse { Groups = new List<GroupResponse>(), Total = 0 });

        var client = CreateAuthedClient();
        var response = await client.GetAsync("/api/Groups");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var wrapper = await response.Content.ReadFromJsonAsync<ApiEnvelope<GroupsResponse>>();
        wrapper!.data.Should().NotBeNull();
        wrapper!.data!.Total.Should().Be(0);
    }

    private sealed class ApiEnvelope<T>
    {
        public T? data { get; set; }
        public string? errorCode { get; set; }
        public string? message { get; set; }
    }
}
