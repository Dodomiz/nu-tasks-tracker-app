using System.Net;
using System.Text.Json;
using TasksTracker.Api.Core.Domain;

namespace TasksTracker.Api.Core.Middleware;

public class ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        
        var response = exception switch
        {
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "UNAUTHORIZED", "Access denied"),
            ArgumentException argEx => (HttpStatusCode.BadRequest, "BAD_REQUEST", argEx.Message),
            KeyNotFoundException => (HttpStatusCode.NotFound, "NOT_FOUND", "Resource not found"),
            InvalidOperationException => (HttpStatusCode.Conflict, "CONFLICT", exception.Message),
            _ => (HttpStatusCode.InternalServerError, "INTERNAL_ERROR", "An unexpected error occurred")
        };

        context.Response.StatusCode = (int)response.Item1;
        
        var apiResponse = ApiResponse<object>.ErrorResponse(response.Item2, response.Item3);
        
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        await context.Response.WriteAsync(JsonSerializer.Serialize(apiResponse, options));
    }
}
