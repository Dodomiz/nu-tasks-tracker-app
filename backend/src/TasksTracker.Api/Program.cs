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

// Register Services
builder.Services.AddScoped<TasksTracker.Api.Features.Auth.Services.IAuthService, TasksTracker.Api.Features.Auth.Services.AuthService>();
builder.Services.AddScoped<TasksTracker.Api.Features.Groups.Services.IGroupService, TasksTracker.Api.Features.Groups.Services.GroupService>();
builder.Services.AddScoped<TasksTracker.Api.Features.Groups.Services.IInvitationService, TasksTracker.Api.Features.Groups.Services.InvitationService>();
builder.Services.AddScoped<TasksTracker.Api.Features.Categories.Services.ICategoryService, TasksTracker.Api.Features.Categories.Services.CategoryService>();

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

// Use custom error handling middleware
app.UseMiddleware<ErrorHandlingMiddleware>();

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }))
   .WithName("HealthCheck")
   .WithOpenApi();

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
