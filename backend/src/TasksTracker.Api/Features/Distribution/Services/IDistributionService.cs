using TasksTracker.Api.Features.Distribution.Models;

namespace TasksTracker.Api.Features.Distribution.Services;

public interface IDistributionService
{
    Task<string> GenerateDistributionAsync(GenerateDistributionRequest request, CancellationToken cancellationToken = default);
    Task<DistributionPreview?> GetPreviewAsync(string previewId);
    Task<ApplyDistributionResponse> ApplyDistributionAsync(string previewId, ApplyDistributionRequest request);
}
