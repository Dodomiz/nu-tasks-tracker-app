using TasksTracker.Api.Features.Workload.Models;

namespace TasksTracker.Api.Features.Workload.Services;

public interface IWorkloadService
{
    Task<WorkloadMetrics> GetGroupWorkloadAsync(string groupId, DifficultyRange range, CancellationToken ct);
    Task<(WorkloadMetrics current, WorkloadMetrics preview)> GetPreviewAsync(string groupId, string assignedTo, int difficulty, CancellationToken ct);
}
