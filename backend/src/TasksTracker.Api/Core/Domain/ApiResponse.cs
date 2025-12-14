namespace TasksTracker.Api.Core.Domain;

public class ApiResponse<T>
{
    public T? Data { get; set; }
    public ApiError? Error { get; set; }
    public bool Success => Error == null;

    public static ApiResponse<T> SuccessResponse(T data) => new() { Data = data };
    public static ApiResponse<T> ErrorResponse(string code, string message, List<ValidationError>? details = null) =>
        new() { Error = new ApiError { Code = code, Message = message, Details = details ?? new List<ValidationError>() } };
}

public class ApiError
{
    public string Code { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public List<ValidationError> Details { get; set; } = new();
}

public class ValidationError
{
    public string Field { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
