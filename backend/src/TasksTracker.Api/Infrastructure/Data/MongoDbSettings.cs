namespace TasksTracker.Api.Infrastructure.Data;

public class MongoDbSettings
{
    public string ConnectionString { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = string.Empty;
    public int MaxConnectionPoolSize { get; set; } = 100;
}
