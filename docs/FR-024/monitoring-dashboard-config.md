# FR-024 Dashboard Optimizations - Monitoring Dashboard Configuration

This document provides configuration for setting up monitoring dashboards for FR-024 using Grafana or similar tools.

---

## Key Metrics to Monitor

### 1. Dashboard Query Performance

**Metric Name:** `dashboard_query_duration_ms`  
**Type:** Histogram  
**Labels:** `operation`, `cache_hit`, `user_id`

**Query Examples:**
```promql
# P95 latency
histogram_quantile(0.95, rate(dashboard_query_duration_ms_bucket[5m]))

# P50 latency
histogram_quantile(0.50, rate(dashboard_query_duration_ms_bucket[5m]))

# Average latency
rate(dashboard_query_duration_ms_sum[5m]) / rate(dashboard_query_duration_ms_count[5m])
```

**Visualization:** Line chart with thresholds:
- 🟢 Green: <100ms
- 🟡 Yellow: 100-200ms
- 🔴 Red: >200ms

---

### 2. Cache Hit Rate

**Metric Name:** `dashboard_cache_hit_rate`  
**Type:** Gauge  
**Labels:** `cache_type`

**Query Examples:**
```promql
# Current cache hit rate
dashboard_cache_hit_rate

# Cache hit rate over time
rate(dashboard_cache_hits_total[5m]) / (rate(dashboard_cache_hits_total[5m]) + rate(dashboard_cache_misses_total[5m]))
```

**Visualization:** Gauge with thresholds:
- 🟢 Green: >70%
- 🟡 Yellow: 50-70%
- 🔴 Red: <50%

---

### 3. Error Rate

**Metric Name:** `dashboard_errors_total`  
**Type:** Counter  
**Labels:** `error_type`, `endpoint`

**Query Examples:**
```promql
# Errors per minute
rate(dashboard_errors_total[1m]) * 60

# Error rate percentage
(rate(dashboard_errors_total[5m]) / rate(dashboard_requests_total[5m])) * 100
```

**Visualization:** Line chart with alert threshold at 5%

---

### 4. Request Volume

**Metric Name:** `dashboard_requests_total`  
**Type:** Counter  
**Labels:** `endpoint`, `status_code`

**Query Examples:**
```promql
# Requests per second
rate(dashboard_requests_total[1m])

# Total requests in last hour
increase(dashboard_requests_total[1h])
```

**Visualization:** Area chart showing request volume over time

---

### 5. Feature Flag Rollout Status

**Metric Name:** `feature_flag_percentage`  
**Type:** Gauge  
**Labels:** `feature_name`

**Query Examples:**
```promql
# Current rollout percentage
feature_flag_percentage{feature_name="DashboardOptimizations"}
```

**Visualization:** Gauge showing 0-100%

---

### 6. MongoDB Query Performance

**Metric Name:** `mongodb_query_duration_ms`  
**Type:** Histogram  
**Labels:** `collection`, `operation`

**Query Examples:**
```promql
# Slow queries (>100ms)
count(mongodb_query_duration_ms_bucket{le="100"}) by (collection)

# Average query time by collection
avg(mongodb_query_duration_ms_sum) by (collection)
```

**Visualization:** Bar chart showing query time by collection

---

### 7. Redis Connection Status

**Metric Name:** `redis_connected`  
**Type:** Gauge  
**Labels:** `cache_type`

**Query Examples:**
```promql
# Redis connection status
redis_connected

# Fallback to in-memory cache
cache_type == "InMemoryCacheService"
```

**Visualization:** Status panel (connected/disconnected)

---

## Grafana Dashboard JSON

### Dashboard Overview Panel

```json
{
  "dashboard": {
    "title": "FR-024 Dashboard Optimizations",
    "panels": [
      {
        "id": 1,
        "title": "P95 Dashboard Query Latency",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(dashboard_query_duration_ms_bucket[5m]))",
            "legendFormat": "P95 Latency"
          }
        ],
        "thresholds": [
          { "value": 100, "colorMode": "custom", "fillColor": "rgba(50, 172, 45, 0.2)" },
          { "value": 200, "colorMode": "custom", "fillColor": "rgba(237, 129, 40, 0.2)" }
        ]
      },
      {
        "id": 2,
        "title": "Cache Hit Rate",
        "type": "gauge",
        "targets": [
          {
            "expr": "dashboard_cache_hit_rate",
            "legendFormat": "Cache Hit Rate"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "percentunit",
            "thresholds": {
              "steps": [
                { "value": 0, "color": "red" },
                { "value": 0.5, "color": "yellow" },
                { "value": 0.7, "color": "green" }
              ]
            }
          }
        }
      },
      {
        "id": 3,
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "(rate(dashboard_errors_total[5m]) / rate(dashboard_requests_total[5m])) * 100",
            "legendFormat": "Error Rate %"
          }
        ],
        "alert": {
          "conditions": [
            {
              "evaluator": { "type": "gt", "params": [5] },
              "operator": { "type": "and" },
              "query": { "params": ["A", "5m", "now"] },
              "type": "query"
            }
          ]
        }
      },
      {
        "id": 4,
        "title": "Request Volume",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(dashboard_requests_total[1m])",
            "legendFormat": "Requests/sec"
          }
        ]
      },
      {
        "id": 5,
        "title": "Feature Rollout Status",
        "type": "gauge",
        "targets": [
          {
            "expr": "feature_flag_percentage{feature_name='DashboardOptimizations'}",
            "legendFormat": "Rollout %"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "percent",
            "max": 100,
            "min": 0
          }
        }
      }
    ]
  }
}
```

---

## Application Insights Integration (If Using Azure)

### Custom Telemetry Code

Add to `CachedDashboardService.cs`:

```csharp
private void TrackMetric(string metricName, double value, Dictionary<string, string> properties)
{
    var telemetry = new MetricTelemetry(metricName, value);
    foreach (var prop in properties)
    {
        telemetry.Properties[prop.Key] = prop.Value;
    }
    _telemetryClient.TrackMetric(telemetry);
}

// Usage in GetUserDashboardAsync
var stopwatch = Stopwatch.StartNew();
var result = await _innerService.GetUserDashboardAsync(userId, page, pageSize);
stopwatch.Stop();

TrackMetric("DashboardQueryDuration", stopwatch.ElapsedMilliseconds, new Dictionary<string, string>
{
    { "operation", "GetUserDashboard" },
    { "cache_hit", "false" },
    { "page", page.ToString() }
});
```

### Application Insights Queries (Kusto)

```kusto
// P95 latency over time
customMetrics
| where name == "DashboardQueryDuration"
| summarize percentile(value, 95) by bin(timestamp, 5m)
| render timechart

// Cache hit rate
customMetrics
| where name == "DashboardCacheHit"
| summarize hits = countif(value == 1), misses = countif(value == 0) by bin(timestamp, 5m)
| extend hit_rate = (hits * 100.0) / (hits + misses)
| render timechart

// Error rate
requests
| where name startswith "/api/dashboard"
| summarize total = count(), errors = countif(resultCode >= 400) by bin(timestamp, 5m)
| extend error_rate = (errors * 100.0) / total
| render timechart
```

---

## Alert Rules

### Critical Alerts (PagerDuty / Slack)

#### 1. Dashboard Error Rate >10%
```yaml
- alert: DashboardErrorRateCritical
  expr: (rate(dashboard_errors_total[5m]) / rate(dashboard_requests_total[5m])) * 100 > 10
  for: 2m
  labels:
    severity: critical
  annotations:
    summary: "Dashboard error rate is critically high"
    description: "Error rate is {{ $value }}% (threshold: 10%)"
```

#### 2. P95 Latency >500ms
```yaml
- alert: DashboardLatencyCritical
  expr: histogram_quantile(0.95, rate(dashboard_query_duration_ms_bucket[5m])) > 500
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Dashboard P95 latency is critically high"
    description: "P95 latency is {{ $value }}ms (threshold: 500ms)"
```

#### 3. Cache Completely Failing
```yaml
- alert: CacheCompleteFailure
  expr: dashboard_cache_hit_rate < 0.01
  for: 10m
  labels:
    severity: critical
  annotations:
    summary: "Cache hit rate is near zero"
    description: "Cache may be completely failing (hit rate: {{ $value }})"
```

---

### Warning Alerts (Slack Only)

#### 1. Dashboard Error Rate >5%
```yaml
- alert: DashboardErrorRateWarning
  expr: (rate(dashboard_errors_total[5m]) / rate(dashboard_requests_total[5m])) * 100 > 5
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Dashboard error rate is elevated"
    description: "Error rate is {{ $value }}% (threshold: 5%)"
```

#### 2. Cache Hit Rate <50%
```yaml
- alert: CacheHitRateLow
  expr: dashboard_cache_hit_rate < 0.5
  for: 15m
  labels:
    severity: warning
  annotations:
    summary: "Cache hit rate is low"
    description: "Hit rate is {{ $value }}% (threshold: 50%)"
```

#### 3. P95 Latency >200ms
```yaml
- alert: DashboardLatencyWarning
  expr: histogram_quantile(0.95, rate(dashboard_query_duration_ms_bucket[5m])) > 200
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "Dashboard P95 latency is elevated"
    description: "P95 latency is {{ $value }}ms (threshold: 200ms)"
```

---

## Log Queries for Debugging

### Check Recent Errors
```bash
# Application logs
journalctl -u tasksTrackerApi --since "10 minutes ago" | grep -i error

# MongoDB logs
tail -f /var/log/mongodb/mongod.log | grep -i "slow query"

# Redis logs
tail -f /var/log/redis/redis-server.log
```

### Analyze Slow Dashboard Queries
```bash
# Enable MongoDB profiling
mongosh "mongodb://localhost:27017/tasks-tracker" --eval "db.setProfilingLevel(2)"

# Query slow operations
mongosh "mongodb://localhost:27017/tasks-tracker" --eval "
  db.system.profile.find({
    ns: 'tasks-tracker.groups',
    millis: { \$gt: 100 }
  }).sort({ ts: -1 }).limit(10).pretty()
"
```

---

## Metrics API Endpoints

### Get Current Metrics
```bash
curl http://localhost:5000/api/dashboard/metrics/summary?lastMinutes=60
```

**Response:**
```json
{
  "totalRequests": 1250,
  "cacheHitRate": 0.73,
  "cacheHits": 912,
  "cacheMisses": 338,
  "averageDurationMs": 45.2,
  "p50DurationMs": 32,
  "p95DurationMs": 87,
  "p99DurationMs": 145,
  "maxDurationMs": 203,
  "minDurationMs": 12,
  "averageResultCount": 8.5,
  "timeWindowMinutes": 60,
  "collectedAt": "2025-12-17T10:30:00Z"
}
```

### Get Raw Metrics Data
```bash
curl http://localhost:5000/api/dashboard/metrics/raw?lastMinutes=10&limit=100
```

---

## Dashboard Refresh Schedule

### Real-Time Monitoring (During Rollout)
- **Refresh Interval:** 10 seconds
- **Panels:** Error rate, P95 latency, cache hit rate
- **Duration:** During each rollout phase (10% → 30% → 70% → 100%)

### Normal Operations
- **Refresh Interval:** 1 minute
- **Panels:** All panels
- **Duration:** Continuous after full rollout

### Weekly Review
- **Refresh Interval:** N/A (static report)
- **Panels:** Trend analysis, cost optimization opportunities
- **Schedule:** Every Monday morning

---

## Cost Monitoring

### Redis Memory Usage
```bash
# Check current memory usage
redis-cli info memory | grep used_memory_human

# Estimate cost (AWS ElastiCache)
# Assuming $0.034/hour for cache.t3.micro (0.5GB)
# With 1MB cache per 1000 users
# 10,000 users = 10MB = $0.034/hour = ~$25/month
```

### MongoDB Query Costs
```bash
# Monitor read units consumed
mongosh "mongodb://localhost:27017/tasks-tracker" --eval "
  db.serverStatus().metrics.document
"

# Estimate savings from caching
# Before: 100 queries/sec × $0.0001/query = $10/sec = $864/day
# After (70% cache hit): 30 queries/sec × $0.0001/query = $3/sec = $259/day
# Savings: $605/day = $18,150/month
```

---

## Next Steps

1. **Set Up Monitoring:**
   - Import Grafana dashboard JSON
   - Configure alert rules in Prometheus/AlertManager
   - Set up Slack webhook for notifications

2. **Baseline Metrics:**
   - Run for 24h with feature flag at 0%
   - Record baseline: error rate, latency, query volume
   - Use baseline for comparison during rollout

3. **Gradual Rollout:**
   - Follow deployment runbook
   - Monitor dashboards closely at each percentage increase
   - Document any anomalies or issues

4. **Post-Rollout:**
   - Reduce refresh interval to 1 minute
   - Set up weekly review reports
   - Optimize thresholds based on actual performance

---

**Document Version:** 1.0  
**Last Updated:** December 17, 2025
