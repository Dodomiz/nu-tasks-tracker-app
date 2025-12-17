using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;

namespace TasksTracker.Api.Infrastructure.FeatureFlags;

/// <summary>
/// Feature flag service with percentage rollout support
/// Enables gradual rollout by user ID (deterministic hashing)
/// </summary>
public interface IFeatureFlagService
{
    bool IsEnabled(string featureName, string? userId = null);
    int GetRolloutPercentage(string featureName);
}

public class PercentageFeatureFlagService(IConfiguration configuration) : IFeatureFlagService
{
    private readonly IConfiguration _configuration = configuration;

    /// <summary>
    /// Check if feature is enabled for a specific user
    /// </summary>
    /// <param name="featureName">Feature flag name (e.g., "DashboardOptimizations")</param>
    /// <param name="userId">User ID for deterministic percentage rollout</param>
    /// <returns>True if feature is enabled for this user</returns>
    public bool IsEnabled(string featureName, string? userId = null)
    {
        // Check if feature flag exists in configuration
        var flagValue = _configuration[$"FeatureFlags:{featureName}"];
        
        if (string.IsNullOrEmpty(flagValue))
        {
            return false; // Feature not configured, default to disabled
        }

        // If value is boolean string, use it directly
        if (bool.TryParse(flagValue, out var boolValue))
        {
            return boolValue;
        }

        // If value is percentage (0-100), check against user hash
        if (int.TryParse(flagValue, out var percentage))
        {
            if (percentage >= 100) return true;
            if (percentage <= 0) return false;

            // If no userId provided, feature is disabled for anonymous requests
            if (string.IsNullOrEmpty(userId))
            {
                return false;
            }

            // Use deterministic hashing to assign user to rollout bucket
            var userBucket = GetUserBucket(userId);
            return userBucket < percentage;
        }

        return false; // Invalid configuration, default to disabled
    }

    /// <summary>
    /// Get current rollout percentage for a feature
    /// </summary>
    public int GetRolloutPercentage(string featureName)
    {
        var flagValue = _configuration[$"FeatureFlags:{featureName}"];
        
        if (string.IsNullOrEmpty(flagValue))
        {
            return 0;
        }

        if (bool.TryParse(flagValue, out var boolValue))
        {
            return boolValue ? 100 : 0;
        }

        if (int.TryParse(flagValue, out var percentage))
        {
            return Math.Clamp(percentage, 0, 100);
        }

        return 0;
    }

    /// <summary>
    /// Map user ID to bucket (0-99) using deterministic hashing
    /// Same user ID always maps to same bucket
    /// </summary>
    private static int GetUserBucket(string userId)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(userId));
        var intValue = BitConverter.ToInt32(hash, 0);
        return Math.Abs(intValue) % 100;
    }
}

/// <summary>
/// Controller extension to access feature flags with user context
/// </summary>
public static class FeatureFlagExtensions
{
    public static bool IsFeatureEnabled(this ControllerBase controller, string featureName)
    {
        var featureFlagService = controller.HttpContext.RequestServices.GetRequiredService<IFeatureFlagService>();
        var userId = controller.User.FindFirst("sub")?.Value ?? controller.User.FindFirst("userId")?.Value;
        return featureFlagService.IsEnabled(featureName, userId);
    }
}
