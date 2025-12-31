using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Features.Notifications.Models;
using TasksTracker.Api.Features.Notifications.Services;

namespace TasksTracker.Api.Features.Notifications.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController(NotificationService notificationService) : ControllerBase
{
    /// <summary>
    /// Create a new notification (system/admin use)
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateNotificationRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.UserId))
            return BadRequest("UserId is required.");

        if (request.Content == null)
            return BadRequest("Content is required.");

        if (string.IsNullOrWhiteSpace(request.Content.Body))
            return BadRequest("Content.Body is required.");

        var id = await notificationService.CreateNotificationAsync(request, ct);
        return Created($"/api/notifications/{id}", new { id });
    }

    /// <summary>
    /// Get notifications for a specific user
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] string userId,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 50,
        CancellationToken ct = default)
    {
        // Validate user is requesting their own notifications (unless admin)
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (currentUserId != userId)
        {
            return Forbid();
        }

        if (take is < 1 or > 100)
            return BadRequest("Take must be between 1 and 100.");

        var notifications = await notificationService.GetUserNotificationsAsync(userId, skip, take, ct);
        return Ok(ApiResponse<List<NotificationResponse>>.SuccessResponse(notifications));
    }

    /// <summary>
    /// Get unread notification count for a user
    /// </summary>
    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount([FromQuery] string userId, CancellationToken ct)
    {
        // Validate user is requesting their own count
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (currentUserId != userId)
        {
            return Forbid();
        }

        var count = await notificationService.GetUnreadCountAsync(userId, ct);
        return Ok(ApiResponse<int>.SuccessResponse(count));
    }

    /// <summary>
    /// Mark a single notification as read
    /// </summary>
    [HttpPut("{notificationId}/read")]
    public async Task<IActionResult> MarkAsRead(string notificationId, CancellationToken ct)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedAccessException("User ID not found in token");

        var success = await notificationService.MarkAsReadAsync(notificationId, userId, ct);
        if (!success)
        {
            return NotFound("Notification not found or unauthorized.");
        }

        return Ok(ApiResponse<object>.SuccessResponse(new { }));
    }

    /// <summary>
    /// Mark all notifications as read for a user
    /// </summary>
    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead([FromQuery] string userId, CancellationToken ct)
    {
        // Validate user is marking their own notifications
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (currentUserId != userId)
        {
            return Forbid();
        }

        await notificationService.MarkAllAsReadAsync(userId, ct);
        return Ok(ApiResponse<object>.SuccessResponse(new { }));
    }
}
