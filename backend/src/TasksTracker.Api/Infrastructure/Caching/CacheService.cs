using System.Text.Json;
using StackExchange.Redis;

namespace TasksTracker.Api.Infrastructure.Caching;

public interface ICacheService
{
    Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default) where T : class;
    Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken cancellationToken = default) where T : class;
    Task RemoveAsync(string key, CancellationToken cancellationToken = default);
    Task RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default);
}

public class RedisCacheService : ICacheService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly IDatabase _database;
    private readonly JsonSerializerOptions _jsonOptions;

    public RedisCacheService(IConnectionMultiplexer redis)
    {
        _redis = redis;
        _database = redis.GetDatabase();
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default) where T : class
    {
        var value = await _database.StringGetAsync(key);
        
        if (value.IsNullOrEmpty)
            return null;

        return JsonSerializer.Deserialize<T>(value!, _jsonOptions);
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken cancellationToken = default) where T : class
    {
        var json = JsonSerializer.Serialize(value, _jsonOptions);
        await _database.StringSetAsync(key, json, expiry);
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        await _database.KeyDeleteAsync(key);
    }

    public async Task RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default)
    {
        var server = _redis.GetServer(_redis.GetEndPoints().First());
        var keys = server.Keys(pattern: pattern).ToArray();
        
        if (keys.Length > 0)
            await _database.KeyDeleteAsync(keys);
    }
}

/// <summary>
/// In-memory cache fallback when Redis is unavailable
/// </summary>
public class InMemoryCacheService : ICacheService
{
    private readonly Dictionary<string, (object value, DateTime expiry)> _cache = new();
    private readonly SemaphoreSlim _lock = new(1, 1);

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default) where T : class
    {
        await _lock.WaitAsync(cancellationToken);
        try
        {
            if (_cache.TryGetValue(key, out var entry))
            {
                if (entry.expiry > DateTime.UtcNow)
                {
                    return entry.value as T;
                }
                _cache.Remove(key);
            }
            return null;
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken cancellationToken = default) where T : class
    {
        await _lock.WaitAsync(cancellationToken);
        try
        {
            var expiryTime = expiry.HasValue ? DateTime.UtcNow.Add(expiry.Value) : DateTime.UtcNow.AddHours(1);
            _cache[key] = (value, expiryTime);
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        await _lock.WaitAsync(cancellationToken);
        try
        {
            _cache.Remove(key);
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default)
    {
        await _lock.WaitAsync(cancellationToken);
        try
        {
            var keysToRemove = _cache.Keys.Where(k => k.Contains(pattern.Replace("*", ""))).ToList();
            foreach (var key in keysToRemove)
            {
                _cache.Remove(key);
            }
        }
        finally
        {
            _lock.Release();
        }
    }
}
