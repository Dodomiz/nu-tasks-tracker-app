using System.Text.Json;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Features.Distribution.Models;
using TasksTracker.Api.Features.Workload.Services;
using TasksTracker.Api.Infrastructure.ServerAccess.OpenAI;

namespace TasksTracker.Api.Features.Distribution.Services;

/// <summary>
/// AI-powered distribution engine using OpenAI GPT
/// </summary>
public class AIDistributionEngine(
    IOpenAIServerAccess openAIAccess,
    IWorkloadService workloadService,
    IConfiguration configuration,
    ILogger<AIDistributionEngine> logger)
{
    /// <summary>
    /// Generate task distribution using AI
    /// </summary>
    public async System.Threading.Tasks.Task<List<AssignmentProposal>> GenerateAsync(
        List<TaskItem> tasks,
        List<User> users,
        CancellationToken cancellationToken = default)
    {
        try
        {
            logger.LogInformation("Generating AI distribution for {TaskCount} tasks and {UserCount} users",
                tasks.Count, users.Count);

            // Get current workloads
            var workloads = new Dictionary<string, double>();
            foreach (var user in users)
            {
                // Simple workload: count of existing tasks (can be enhanced with actual workload service)
                workloads[user.Id] = 0; // Placeholder - would query actual workload
            }

            // Build prompt
            var systemPrompt = BuildSystemPrompt();
            var userPrompt = BuildUserPrompt(tasks, users, workloads);

            // Call OpenAI
            var request = new ChatCompletionRequest
            {
                Model = configuration["OpenAI:Model"] ?? "gpt-4",
                Messages =
                [
                    new ChatMessage { Role = "system", Content = systemPrompt },
                    new ChatMessage { Role = "user", Content = userPrompt }
                ],
                Temperature = double.Parse(configuration["OpenAI:Temperature"] ?? "0.7"),
                MaxTokens = int.Parse(configuration["OpenAI:MaxTokens"] ?? "2000"),
                ResponseFormat = new { type = "json_object" }
            };

            var response = await openAIAccess.ChatCompletionAsync(request, cancellationToken);

            // Parse response
            var assignments = ParseResponse(response, tasks, users);

            logger.LogInformation("AI generated {AssignmentCount} assignments", assignments.Count);

            return assignments;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error generating AI distribution");
            throw;
        }
    }

    private string BuildSystemPrompt()
    {
        return @"You are a task distribution assistant. Your goal is to assign tasks to users fairly and efficiently.

Consider these factors:
1. Balance workload across users (minimize variance)
2. Match tasks to user preferences when available
3. Respect user availability constraints
4. Consider historical performance for similar tasks
5. Aim for <15% workload variance

Respond with a JSON object containing an 'assignments' array. Each assignment should have:
- taskId: string (the task ID)
- assignedUserId: string (the user ID to assign to)
- confidence: number (0.0 to 1.0, how confident you are in this assignment)
- rationale: string (brief explanation of why this assignment makes sense)

Example:
{
  ""assignments"": [
    {
      ""taskId"": ""task123"",
      ""assignedUserId"": ""user456"",
      ""confidence"": 0.85,
      ""rationale"": ""User has low workload and experience with similar tasks""
    }
  ]
}";
    }

    private string BuildUserPrompt(
        List<TaskItem> tasks,
        List<User> users,
        Dictionary<string, double> workloads)
    {
        var taskList = tasks.Select(t => new
        {
            id = t.Id,
            name = t.Name,
            difficulty = t.Difficulty,
            dueAt = t.DueAt
        });

        var userList = users.Select(u => new
        {
            id = u.Id,
            name = $"{u.FirstName} {u.LastName}",
            currentWorkload = workloads.GetValueOrDefault(u.Id, 0)
        });

        var prompt = $@"Please distribute these tasks among the users:

Tasks:
{JsonSerializer.Serialize(taskList, new JsonSerializerOptions { WriteIndented = true })}

Users:
{JsonSerializer.Serialize(userList, new JsonSerializerOptions { WriteIndented = true })}

Create a fair distribution that balances workload and considers task difficulty. Provide confidence scores and rationale for each assignment.";

        return prompt;
    }

    private List<AssignmentProposal> ParseResponse(
        ChatCompletionResponse response,
        List<TaskItem> tasks,
        List<User> users)
    {
        try
        {
            var content = response.Choices.FirstOrDefault()?.Message.Content;
            if (string.IsNullOrWhiteSpace(content))
            {
                throw new InvalidOperationException("Empty response from OpenAI");
            }

            logger.LogDebug("Parsing AI response: {Content}", content);

            var jsonDoc = JsonDocument.Parse(content);
            var assignments = new List<AssignmentProposal>();

            if (!jsonDoc.RootElement.TryGetProperty("assignments", out var assignmentsArray))
            {
                throw new InvalidOperationException("Response does not contain 'assignments' property");
            }

            foreach (var assignment in assignmentsArray.EnumerateArray())
            {
                var taskId = assignment.GetProperty("taskId").GetString();
                var assignedUserId = assignment.GetProperty("assignedUserId").GetString();
                var confidence = assignment.TryGetProperty("confidence", out var confProp)
                    ? confProp.GetDouble()
                    : 0.5;
                var rationale = assignment.TryGetProperty("rationale", out var ratProp)
                    ? ratProp.GetString()
                    : "AI recommendation";

                var task = tasks.FirstOrDefault(t => t.Id == taskId);
                var user = users.FirstOrDefault(u => u.Id == assignedUserId);

                if (task == null || user == null)
                {
                    logger.LogWarning("Skipping invalid assignment: task={TaskId}, user={UserId}", taskId, assignedUserId);
                    continue;
                }

                assignments.Add(new AssignmentProposal
                {
                    TaskId = taskId!,
                    TaskName = task.Name,
                    AssignedUserId = assignedUserId!,
                    AssignedUserName = $"{user.FirstName} {user.LastName}",
                    Confidence = confidence,
                    Rationale = rationale
                });
            }

            return assignments;
        }
        catch (JsonException ex)
        {
            logger.LogError(ex, "Failed to parse AI response as JSON");
            throw new InvalidOperationException("Invalid JSON response from AI", ex);
        }
    }
}
