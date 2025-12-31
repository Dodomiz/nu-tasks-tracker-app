using TasksTracker.Api.Core.Domain;
using TasksTracker.Api.Features.Notifications.Models;
using TasksTracker.Api.Features.Notifications.Repositories;

namespace TasksTracker.Api.Features.Notifications.Services;

public class NotificationService(NotificationRepository repository, ILogger<NotificationService> logger)
{
    public async Task<string> CreateNotificationAsync(
        CreateNotificationRequest request,
        CancellationToken ct = default)
    {
        logger.LogInformation(
            "Creating notification for user {UserId} of type {Type}",
            request.UserId,
            request.Type
        );

        var notification = new Notification
        {
            UserId = request.UserId,
            Type = request.Type,
            Content = new NotificationContent
            {
                Title = request.Content.Title,
                Body = request.Content.Body,
                Metadata = request.Content.Metadata
            },
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        return await repository.CreateAsync(notification, ct);
    }

    public async Task<List<NotificationResponse>> GetUserNotificationsAsync(
        string userId,
        int skip = 0,
        int take = 50,
        CancellationToken ct = default)
    {
        var notifications = await repository.GetByUserIdAsync(userId, skip, take, ct);

        return notifications.Select(n => new NotificationResponse(
            n.Id,
            n.UserId,
            n.Type,
            new NotificationContentDto(n.Content.Title, n.Content.Body, n.Content.Metadata),
            n.IsRead,
            n.CreatedAt
        )).ToList();
    }

    public async Task<int> GetUnreadCountAsync(string userId, CancellationToken ct = default)
    {
        return await repository.GetUnreadCountAsync(userId, ct);
    }

    public async Task<bool> MarkAsReadAsync(string notificationId, string userId, CancellationToken ct = default)
    {
        // Validate ownership
        var notification = await repository.GetByIdAsync(notificationId, ct);
        if (notification == null || notification.UserId != userId)
        {
            logger.LogWarning(
                "Attempted to mark notification {NotificationId} as read by unauthorized user {UserId}",
                notificationId,
                userId
            );
            return false;
        }

        await repository.MarkAsReadAsync(notificationId, ct);
        logger.LogInformation(
            "Marked notification {NotificationId} as read for user {UserId}",
            notificationId,
            userId
        );
        return true;
    }

    public async Task MarkAllAsReadAsync(string userId, CancellationToken ct = default)
    {
        await repository.MarkAllAsReadAsync(userId, ct);
        logger.LogInformation("Marked all notifications as read for user {UserId}", userId);
    }
}
