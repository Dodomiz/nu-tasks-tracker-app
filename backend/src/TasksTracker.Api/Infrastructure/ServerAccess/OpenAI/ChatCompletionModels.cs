namespace TasksTracker.Api.Infrastructure.ServerAccess.OpenAI;

/// <summary>
/// Request model for OpenAI Chat Completion API
/// </summary>
public class ChatCompletionRequest
{
    public required string Model { get; set; }
    public required List<ChatMessage> Messages { get; set; }
    public double Temperature { get; set; } = 0.7;
    public int MaxTokens { get; set; } = 2000;
    public object? ResponseFormat { get; set; }
}

/// <summary>
/// Individual message in a chat conversation
/// </summary>
public class ChatMessage
{
    public required string Role { get; set; } // "system", "user", "assistant"
    public required string Content { get; set; }
}

/// <summary>
/// Response model from OpenAI Chat Completion API
/// </summary>
public class ChatCompletionResponse
{
    public required string Id { get; set; }
    public required string Object { get; set; }
    public long Created { get; set; }
    public required string Model { get; set; }
    public required List<ChatChoice> Choices { get; set; }
    public ChatUsage? Usage { get; set; }
}

/// <summary>
/// Individual choice from the completion response
/// </summary>
public class ChatChoice
{
    public int Index { get; set; }
    public required ChatMessage Message { get; set; }
    public string? FinishReason { get; set; }
}

/// <summary>
/// Token usage information
/// </summary>
public class ChatUsage
{
    public int PromptTokens { get; set; }
    public int CompletionTokens { get; set; }
    public int TotalTokens { get; set; }
}
