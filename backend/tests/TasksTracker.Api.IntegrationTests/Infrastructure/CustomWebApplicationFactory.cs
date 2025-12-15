using System.Linq;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using TasksTracker.Api.Features.Groups.Models;
using TasksTracker.Api.Features.Groups.Services;
using TasksTracker.Api.Features.Categories.Services;
using TasksTracker.Api.Features.Templates.Services;

namespace TasksTracker.Api.IntegrationTests.Infrastructure;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    public Mock<IGroupService> GroupServiceMock { get; } = new();
    public Mock<ICategoryService> CategoryServiceMock { get; } = new();
    public Mock<ITemplateService> TemplateServiceMock { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureTestServices(services =>
        {
            // Replace authentication with test scheme
            services.AddAuthentication(TestAuthHandler.Scheme)
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(TestAuthHandler.Scheme, _ => { });

            // Make test scheme default
            services.PostConfigureAll<AuthenticationOptions>(options =>
            {
                options.DefaultAuthenticateScheme = TestAuthHandler.Scheme;
                options.DefaultChallengeScheme = TestAuthHandler.Scheme;
            });

            // Swap IGroupService with mock
            var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(IGroupService));
            if (descriptor != null)
            {
                services.Remove(descriptor);
            }
            services.AddSingleton(GroupServiceMock.Object);

            // Swap ICategoryService with mock
            var catDesc = services.SingleOrDefault(d => d.ServiceType == typeof(ICategoryService));
            if (catDesc != null)
            {
                services.Remove(catDesc);
            }
            services.AddSingleton(CategoryServiceMock.Object);

                    // Swap ITemplateService with mock
                    var templateDesc = services.SingleOrDefault(d => d.ServiceType == typeof(ITemplateService));
                    if (templateDesc != null)
                    {
                        services.Remove(templateDesc);
                    }
                    services.AddSingleton(TemplateServiceMock.Object);
        });
    }
}
