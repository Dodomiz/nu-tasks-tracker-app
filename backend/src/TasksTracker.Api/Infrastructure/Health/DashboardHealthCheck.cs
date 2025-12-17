using Microsoft.Extensions.Diagnostics.HealthChecks;
using TasksTracker.Api.Features.Dashboard.Services;
using TasksTracker.Api.Infrastructure.Caching;

namespace TasksTracker.Api.Infrastructure.Health;

/// <summary>
/// Health check for dashboard service and cache availability
/// </summary>
public class DashboardHealthCheck(IDashboardService dashboardService, ICacheService cacheService) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        var data = new Dictionary<string, object>();

        try
        {
            // Check cache connectivity
            var cacheTestKey = "health:check:test";
            await cacheService.SetAsync(cacheTestKey, "test", TimeSpan.FromSeconds(10));
            var cacheValue = await cacheService.GetAsync<string>(cacheTestKey);
            await cacheService.RemoveAsync(cacheTestKey);

            var cacheHealthy = cacheValue == "test";
            data["cache_available"] = cacheHealthy;
            data["cache_type"] = cacheService.GetType().Name;

            if (!cacheHealthy)
            {
                return HealthCheckResult.Degraded("Cache not functioning properly", data: data);
            }

            // Check dashboard service (quick test with page size 1)
            var testUserId = "000000000000000000000001"; // Test user ID
            var testResponse = await dashboardService.GetDashboardAsync(testUserId, 1, 1, cancellationToken);
            
            data["dashboard_service_available"] = true;
            data["test_response_time_ms"] = DateTime.UtcNow.Millisecond;

            return HealthCheckResult.Healthy("Dashboard service and cache are healthy", data: data);
        }
        catch (Exception ex)
        {
            data["error"] = ex.Message;
            return HealthCheckResult.Unhealthy("Dashboard health check failed", ex, data);
        }
    }
}
