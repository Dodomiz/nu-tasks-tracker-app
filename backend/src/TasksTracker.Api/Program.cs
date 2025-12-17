using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using Serilog;
using System.Text;
using TasksTracker.Api.Core.Interfaces;
using TasksTracker.Api.Core.Middleware;
using TasksTracker.Api.Infrastructure.Data;
using TasksTracker.Api.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog - reads all configuration from appsettings.json
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Host.UseSerilog();

// Add MongoDB
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));

builder.Services.AddSingleton<IMongoClient>(_ =>
{
    var settings = builder.Configuration.GetSection("MongoDbSettings").Get<MongoDbSettings>();
    return new MongoClient(settings!.ConnectionString);
});

builder.Services.AddSingleton<IMongoDatabase>(sp =>
{
    var client = sp.GetRequiredService<IMongoClient>();
    var settings = builder.Configuration.GetSection("MongoDbSettings").Get<MongoDbSettings>();
    return client.GetDatabase(settings!.DatabaseName);
});

builder.Services.AddSingleton<MongoDbContext>();

// Register Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IGroupRepository, GroupRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ITemplateRepository, TemplateRepository>();
builder.Services.AddScoped<ITaskRepository, TaskRepository>();
builder.Services.AddScoped<IDistributionRepository, DistributionRepository>();
builder.Services.AddScoped<IInvitesRepository, InvitesRepository>();

// Configure Redis Cache (optional, falls back to in-memory)
var redisConnection = builder.Configuration.GetConnectionString("Redis");
var useDashboardOptimizations = builder.Configuration.GetValue<bool>("FeatureFlags:DashboardOptimizations", false);

if (!string.IsNullOrEmpty(redisConnection))
{
    try
    {
        builder.Services.AddSingleton<StackExchange.Redis.IConnectionMultiplexer>(sp =>
            StackExchange.Redis.ConnectionMultiplexer.Connect(redisConnection));
        builder.Services.AddSingleton<TasksTracker.Api.Infrastructure.Caching.ICacheService, TasksTracker.Api.Infrastructure.Caching.RedisCacheService>();
        Log.Information("Redis cache configured: {Connection}", redisConnection.Split(',')[0]);
    }
    catch (Exception ex)
    {
        Log.Warning(ex, "Redis connection failed, falling back to in-memory cache");
        builder.Services.AddSingleton<TasksTracker.Api.Infrastructure.Caching.ICacheService, TasksTracker.Api.Infrastructure.Caching.InMemoryCacheService>();
    }
}
else
{
    Log.Information("Redis not configured, using in-memory cache");
    builder.Services.AddSingleton<TasksTracker.Api.Infrastructure.Caching.ICacheService, TasksTracker.Api.Infrastructure.Caching.InMemoryCacheService>();
}

// Register Services
builder.Services.AddScoped<TasksTracker.Api.Features.Auth.Services.IAuthService, TasksTracker.Api.Features.Auth.Services.AuthService>();
builder.Services.AddScoped<TasksTracker.Api.Features.Groups.Services.IGroupService, TasksTracker.Api.Features.Groups.Services.GroupService>();
builder.Services.AddScoped<TasksTracker.Api.Features.Groups.Services.IInvitationService, TasksTracker.Api.Features.Groups.Services.InvitationService>();
builder.Services.AddScoped<TasksTracker.Api.Features.Groups.Services.IInvitesService, TasksTracker.Api.Features.Groups.Services.InvitesService>();
builder.Services.AddScoped<TasksTracker.Api.Features.Categories.Services.ICategoryService, TasksTracker.Api.Features.Categories.Services.CategoryService>();
builder.Services.AddScoped<TasksTracker.Api.Features.Templates.Services.ITemplateService, TasksTracker.Api.Features.Templates.Services.TemplateService>();
builder.Services.AddScoped<TasksTracker.Api.Features.Tasks.Services.ITaskService, TasksTracker.Api.Features.Tasks.Services.TaskService>();
builder.Services.AddScoped<TasksTracker.Api.Features.Workload.Services.IWorkloadService, TasksTracker.Api.Features.Workload.Services.WorkloadService>();
builder.Services.AddScoped<TasksTracker.Api.Features.Distribution.Services.IDistributionService, TasksTracker.Api.Features.Distribution.Services.DistributionService>();
builder.Services.AddScoped<TasksTracker.Api.Features.Distribution.Services.AIDistributionEngine>();
builder.Services.AddScoped<TasksTracker.Api.Features.Distribution.Services.RuleBasedDistributor>();

// Register Feature Flag Service (FR-024 Sprint 3)
builder.Services.AddSingleton<TasksTracker.Api.Infrastructure.FeatureFlags.IFeatureFlagService, TasksTracker.Api.Infrastructure.FeatureFlags.PercentageFeatureFlagService>();

// Dashboard service with optional optimizations (FR-024 Sprint 2)
if (useDashboardOptimizations)
{
    builder.Services.AddScoped<TasksTracker.Api.Features.Dashboard.Services.DashboardService>();
    builder.Services.AddScoped<TasksTracker.Api.Features.Dashboard.Services.DashboardServiceOptimized>();
    builder.Services.AddScoped<TasksTracker.Api.Features.Dashboard.Services.IDashboardService>(sp =>
    {
        var optimized = sp.GetRequiredService<TasksTracker.Api.Features.Dashboard.Services.DashboardServiceOptimized>();
        var cache = sp.GetRequiredService<TasksTracker.Api.Infrastructure.Caching.ICacheService>();
        var logger = sp.GetRequiredService<ILogger<TasksTracker.Api.Features.Dashboard.Services.CachedDashboardService>>();
        return new TasksTracker.Api.Features.Dashboard.Services.CachedDashboardService(optimized, cache, logger);
    });
    Log.Information("Dashboard optimizations enabled (aggregation + caching)");
}
else
{
    builder.Services.AddScoped<TasksTracker.Api.Features.Dashboard.Services.IDashboardService, TasksTracker.Api.Features.Dashboard.Services.DashboardService>();
    Log.Information("Dashboard optimizations disabled (basic service)");
}

// Register HttpClient for OpenAI
builder.Services.AddHttpClient("OpenAI");

// Register OpenAI ServerAccess
builder.Services.AddScoped<TasksTracker.Api.Infrastructure.ServerAccess.OpenAI.IOpenAIServerAccess, TasksTracker.Api.Infrastructure.ServerAccess.OpenAI.OpenAIServerAccess>();

// Add JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Add Health Checks (FR-024 Sprint 3)
builder.Services.AddHealthChecks()
    .AddCheck<TasksTracker.Api.Infrastructure.Health.DashboardHealthCheck>("dashboard", tags: new[] { "ready" });

// Add Controllers
builder.Services.AddControllers();

// Add API Explorer for Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure HTTP request pipeline
if (!app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => 
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "TasksTracker API v1");
        c.RoutePrefix = "swagger";
    });
}
// Seed system templates
using (var scope = app.Services.CreateScope())
{
    try
    {
        var templateRepository = scope.ServiceProvider.GetRequiredService<ITemplateRepository>();
        var categoryRepository = scope.ServiceProvider.GetRequiredService<ICategoryRepository>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<TemplateSeeder>>();
        
        var seeder = new TemplateSeeder(templateRepository, categoryRepository, logger);
        await seeder.SeedSystemTemplatesAsync();
    }
    catch (Exception ex)
    {
        Log.Error(ex, "An error occurred while seeding system templates");
    }
}


// Use custom error handling middleware
app.UseMiddleware<ErrorHandlingMiddleware>();

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health check endpoint with detailed checks (FR-024 Sprint 3)
app.MapHealthChecks("/health");

// Log URLs after server starts
app.Lifetime.ApplicationStarted.Register(() =>
{
    var addresses = app.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>();
    if (addresses != null && addresses.Addresses.Any())
    {
        foreach (var address in addresses.Addresses)
        {
            Log.Information("Now listening on: {Address}", address);
        }
        
        var firstAddress = addresses.Addresses.First();
        if (!app.Environment.IsProduction())
        {
            Log.Information("Swagger UI: {SwaggerUrl}/swagger", firstAddress);
        }
    }
});

try
{
    Log.Information("Starting TasksTracker API");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}

public partial class Program { }
