using StackExchange.Redis;
using System.Text.Json;

namespace TasksTracker.Api.Infrastructure.Cache;

public interface ICacheService
{
    Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default) where T : class;
    Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken cancellationToken = default) where T : class;
    Task<bool> DeleteAsync(string key, CancellationToken cancellationToken = default);
    Task<long> DeletePatternAsync(string pattern, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default);
}

public class CacheService : ICacheService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly ILogger<CacheService> _logger;
    private readonly TimeSpan _defaultExpiry;

    public CacheService(
        IConnectionMultiplexer redis,
        ILogger<CacheService> logger,
        IConfiguration configuration)
    {
        _redis = redis;
        _logger = logger;
        
        // Default TTL: 5 minutes (can be overridden in appsettings.json)
        var expiryMinutes = configuration.GetValue<int>("Cache:DefaultExpiryMinutes", 5);
        _defaultExpiry = TimeSpan.FromMinutes(expiryMinutes);
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default) where T : class
    {
        try
        {
            var db = _redis.GetDatabase();
            var value = await db.StringGetAsync(key);

            if (value.IsNullOrEmpty)
            {
                _logger.LogDebug("Cache miss for key: {Key}", key);
                return null;
            }

            _logger.LogDebug("Cache hit for key: {Key}", key);
            return JsonSerializer.Deserialize<T>(value!);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving cache key: {Key}", key);
            return null;
        }
    }

    public async Task SetAsync<T>(
        string key,
        T value,
        TimeSpan? expiry = null,
        CancellationToken cancellationToken = default) where T : class
    {
        try
        {
            var db = _redis.GetDatabase();
            var serialized = JsonSerializer.Serialize(value);
            var expiryTime = expiry ?? _defaultExpiry;

            await db.StringSetAsync(key, serialized, expiryTime);

            _logger.LogDebug("Cache set for key: {Key}, TTL: {Expiry}s", key, expiryTime.TotalSeconds);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting cache key: {Key}", key);
        }
    }

    public async Task<bool> DeleteAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            var db = _redis.GetDatabase();
            var deleted = await db.KeyDeleteAsync(key);

            if (deleted)
            {
                _logger.LogDebug("Cache deleted for key: {Key}", key);
            }

            return deleted;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting cache key: {Key}", key);
            return false;
        }
    }

    public async Task<long> DeletePatternAsync(string pattern, CancellationToken cancellationToken = default)
    {
        try
        {
            var server = _redis.GetServer(_redis.GetEndPoints().First());
            var db = _redis.GetDatabase();

            var keys = server.Keys(pattern: pattern).ToArray();

            if (keys.Length == 0)
            {
                _logger.LogDebug("No keys found matching pattern: {Pattern}", pattern);
                return 0;
            }

            var deletedCount = await db.KeyDeleteAsync(keys);

            _logger.LogInformation("Cache invalidation: {Count} keys deleted matching pattern: {Pattern}",
                deletedCount, pattern);

            return deletedCount;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting cache keys matching pattern: {Pattern}", pattern);
            return 0;
        }
    }

    public async Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            var db = _redis.GetDatabase();
            return await db.KeyExistsAsync(key);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking cache key existence: {Key}", key);
            return false;
        }
    }
}
