using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace TasksTracker.Api.Infrastructure.ServerAccess.OpenAI;

/// <summary>
/// Implementation of OpenAI API client
/// </summary>
public class OpenAIServerAccess(IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<OpenAIServerAccess> logger) : IOpenAIServerAccess
{
    private const string BaseUrl = "https://api.openai.com/v1";
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
    };

    public async Task<ChatCompletionResponse> ChatCompletionAsync(
        ChatCompletionRequest request,
        CancellationToken cancellationToken = default)
    {
        var apiKey = configuration["OpenAI:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            logger.LogError("OpenAI API key not configured");
            throw new InvalidOperationException("OpenAI API key is not configured. Please set 'OpenAI:ApiKey' in appsettings.json");
        }

        var client = httpClientFactory.CreateClient("OpenAI");
        client.BaseAddress = new Uri(BaseUrl);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        client.Timeout = TimeSpan.FromSeconds(30); // 30s timeout for AI requests

        var jsonRequest = JsonSerializer.Serialize(request, _jsonOptions);
        logger.LogDebug("Sending OpenAI request: {Request}", jsonRequest);

        var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

        try
        {
            var response = await client.PostAsync("/chat/completions", content, cancellationToken);
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                logger.LogError("OpenAI API error: {StatusCode} - {Content}", response.StatusCode, responseContent);
                throw new HttpRequestException($"OpenAI API returned {response.StatusCode}: {responseContent}");
            }

            logger.LogDebug("OpenAI response: {Response}", responseContent);

            var completionResponse = JsonSerializer.Deserialize<ChatCompletionResponse>(responseContent, _jsonOptions);
            if (completionResponse == null)
            {
                throw new InvalidOperationException("Failed to deserialize OpenAI response");
            }

            logger.LogInformation("OpenAI request completed. Tokens used: {Tokens}", completionResponse.Usage?.TotalTokens ?? 0);

            return completionResponse;
        }
        catch (TaskCanceledException)
        {
            logger.LogWarning("OpenAI request timed out");
            throw new TimeoutException("OpenAI API request timed out after 30 seconds");
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "HTTP error calling OpenAI API");
            throw;
        }
    }
}
