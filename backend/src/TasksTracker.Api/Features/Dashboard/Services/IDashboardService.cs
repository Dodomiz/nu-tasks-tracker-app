using TasksTracker.Api.Features.Dashboard.Models;

namespace TasksTracker.Api.Features.Dashboard.Services;

public interface IDashboardService
{
    Task<DashboardResponse> GetDashboardAsync(string userId, int page, int pageSize, CancellationToken ct);
}
