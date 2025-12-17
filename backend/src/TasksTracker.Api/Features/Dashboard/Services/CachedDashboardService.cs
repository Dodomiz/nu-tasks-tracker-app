using TasksTracker.Api.Features.Dashboard.Models;
using TasksTracker.Api.Infrastructure.Caching;

namespace TasksTracker.Api.Features.Dashboard.Services;

/// <summary>
/// Cached dashboard service wrapper with Redis support (Sprint 2 - FR-024)
/// Implements cache-aside pattern with automatic invalidation
/// </summary>
public class CachedDashboardService(
    IDashboardService innerService,
    ICacheService cacheService,
    ILogger<CachedDashboardService> logger) : IDashboardService
{
    private const string CacheKeyPrefix = "dashboard";
    private static readonly TimeSpan CacheExpiry = TimeSpan.FromMinutes(5);

    public async Task<DashboardResponse> GetDashboardAsync(string userId, int page, int pageSize, CancellationToken ct)
    {
        var cacheKey = BuildCacheKey(userId, page, pageSize);

        try
        {
            // Try to get from cache
            var cached = await cacheService.GetAsync<DashboardResponse>(cacheKey, ct);
            if (cached != null)
            {
                logger.LogDebug("Dashboard cache hit for user {UserId}, page {Page}", userId, page);
                return cached;
            }

            logger.LogDebug("Dashboard cache miss for user {UserId}, page {Page}", userId, page);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Cache read failed for user {UserId}, falling back to database", userId);
        }

        // Cache miss - fetch from database
        var response = await innerService.GetDashboardAsync(userId, page, pageSize, ct);

        try
        {
            // Store in cache
            await cacheService.SetAsync(cacheKey, response, CacheExpiry, ct);
            logger.LogDebug("Cached dashboard for user {UserId}, page {Page}", userId, page);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Cache write failed for user {UserId}", userId);
            // Continue without caching - don't fail the request
        }

        return response;
    }

    /// <summary>
    /// Invalidate dashboard cache for a specific user
    /// Call this when user's groups or tasks change
    /// </summary>
    public async Task InvalidateUserCacheAsync(string userId, CancellationToken ct = default)
    {
        try
        {
            var pattern = $"{CacheKeyPrefix}:user:{userId}:*";
            await cacheService.RemoveByPatternAsync(pattern, ct);
            logger.LogInformation("Invalidated dashboard cache for user {UserId}", userId);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Cache invalidation failed for user {UserId}", userId);
        }
    }

    /// <summary>
    /// Invalidate dashboard cache for all members of a group
    /// Call this when group data changes (members, tasks, etc.)
    /// </summary>
    public async Task InvalidateGroupCacheAsync(List<string> memberUserIds, CancellationToken ct = default)
    {
        try
        {
            foreach (var userId in memberUserIds)
            {
                await InvalidateUserCacheAsync(userId, ct);
            }
            logger.LogInformation("Invalidated dashboard cache for {Count} group members", memberUserIds.Count);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Group cache invalidation failed");
        }
    }

    private static string BuildCacheKey(string userId, int page, int pageSize)
    {
        return $"{CacheKeyPrefix}:user:{userId}:page:{page}:size:{pageSize}";
    }
}
