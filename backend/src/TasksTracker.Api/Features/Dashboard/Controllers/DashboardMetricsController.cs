using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace TasksTracker.Api.Features.Dashboard.Controllers;

/// <summary>
/// Provides performance metrics for dashboard operations
/// </summary>
[ApiController]
[Route("api/dashboard/metrics")]
[Authorize]
public class DashboardMetricsController : ControllerBase
{
    private static readonly List<PerformanceMetric> RecentMetrics = new();
    private static readonly object MetricsLock = new();
    private const int MaxMetricsHistory = 1000;

    /// <summary>
    /// Record a dashboard query metric (called internally)
    /// </summary>
    public static void RecordMetric(string operation, long durationMs, bool cacheHit, int resultCount)
    {
        lock (MetricsLock)
        {
            RecentMetrics.Add(new PerformanceMetric
            {
                Timestamp = DateTime.UtcNow,
                Operation = operation,
                DurationMs = durationMs,
                CacheHit = cacheHit,
                ResultCount = resultCount
            });

            // Keep only recent metrics
            if (RecentMetrics.Count > MaxMetricsHistory)
            {
                RecentMetrics.RemoveAt(0);
            }
        }
    }

    /// <summary>
    /// Get dashboard performance metrics summary
    /// </summary>
    [HttpGet("summary")]
    public ActionResult<MetricsSummary> GetMetricsSummary([FromQuery] int? lastMinutes = 60)
    {
        lock (MetricsLock)
        {
            var cutoff = DateTime.UtcNow.AddMinutes(-lastMinutes.Value);
            var recentMetrics = RecentMetrics.Where(m => m.Timestamp >= cutoff).ToList();

            if (!recentMetrics.Any())
            {
                return Ok(new MetricsSummary
                {
                    TotalRequests = 0,
                    TimeWindowMinutes = lastMinutes.Value,
                    Message = "No metrics available for the specified time window"
                });
            }

            var cacheHits = recentMetrics.Count(m => m.CacheHit);
            var cacheMisses = recentMetrics.Count(m => !m.CacheHit);

            return Ok(new MetricsSummary
            {
                TotalRequests = recentMetrics.Count,
                CacheHitRate = cacheHits / (double)recentMetrics.Count,
                CacheHits = cacheHits,
                CacheMisses = cacheMisses,
                AverageDurationMs = recentMetrics.Average(m => m.DurationMs),
                P50DurationMs = CalculatePercentile(recentMetrics.Select(m => m.DurationMs).ToList(), 0.5),
                P95DurationMs = CalculatePercentile(recentMetrics.Select(m => m.DurationMs).ToList(), 0.95),
                P99DurationMs = CalculatePercentile(recentMetrics.Select(m => m.DurationMs).ToList(), 0.99),
                MaxDurationMs = recentMetrics.Max(m => m.DurationMs),
                MinDurationMs = recentMetrics.Min(m => m.DurationMs),
                AverageResultCount = recentMetrics.Average(m => m.ResultCount),
                TimeWindowMinutes = lastMinutes.Value,
                CollectedAt = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Get raw metrics data for detailed analysis
    /// </summary>
    [HttpGet("raw")]
    public ActionResult<List<PerformanceMetric>> GetRawMetrics([FromQuery] int? lastMinutes = 10, [FromQuery] int? limit = 100)
    {
        lock (MetricsLock)
        {
            var cutoff = DateTime.UtcNow.AddMinutes(-lastMinutes.Value);
            var filteredMetrics = RecentMetrics
                .Where(m => m.Timestamp >= cutoff)
                .OrderByDescending(m => m.Timestamp)
                .Take(limit.Value)
                .ToList();

            return Ok(filteredMetrics);
        }
    }

    /// <summary>
    /// Clear all metrics (admin only)
    /// </summary>
    [HttpPost("clear")]
    public ActionResult ClearMetrics()
    {
        lock (MetricsLock)
        {
            var count = RecentMetrics.Count;
            RecentMetrics.Clear();
            return Ok(new { message = $"Cleared {count} metrics" });
        }
    }

    private static long CalculatePercentile(List<long> values, double percentile)
    {
        if (!values.Any()) return 0;
        
        var sorted = values.OrderBy(v => v).ToList();
        var index = (int)Math.Ceiling(percentile * sorted.Count) - 1;
        return sorted[Math.Max(0, Math.Min(index, sorted.Count - 1))];
    }
}

public class PerformanceMetric
{
    public DateTime Timestamp { get; set; }
    public string Operation { get; set; } = string.Empty;
    public long DurationMs { get; set; }
    public bool CacheHit { get; set; }
    public int ResultCount { get; set; }
}

public class MetricsSummary
{
    public int TotalRequests { get; set; }
    public double CacheHitRate { get; set; }
    public int CacheHits { get; set; }
    public int CacheMisses { get; set; }
    public double AverageDurationMs { get; set; }
    public long P50DurationMs { get; set; }
    public long P95DurationMs { get; set; }
    public long P99DurationMs { get; set; }
    public long MaxDurationMs { get; set; }
    public long MinDurationMs { get; set; }
    public double AverageResultCount { get; set; }
    public int TimeWindowMinutes { get; set; }
    public DateTime CollectedAt { get; set; }
    public string? Message { get; set; }
}
