namespace TasksTracker.Api.Infrastructure.ServerAccess.OpenAI;

/// <summary>
/// Interface for OpenAI API client
/// </summary>
public interface IOpenAIServerAccess
{
    /// <summary>
    /// Sends a chat completion request to OpenAI API
    /// </summary>
    /// <param name="request">The chat completion request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The completion response</returns>
    Task<ChatCompletionResponse> ChatCompletionAsync(
        ChatCompletionRequest request,
        CancellationToken cancellationToken = default);
}
