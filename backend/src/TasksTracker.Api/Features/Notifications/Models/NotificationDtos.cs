using TasksTracker.Api.Core.Domain;

namespace TasksTracker.Api.Features.Notifications.Models;

public record NotificationResponse(
    string Id,
    string UserId,
    NotificationType Type,
    NotificationContentDto Content,
    bool IsRead,
    DateTime CreatedAt
);

public record NotificationContentDto(
    string Title,
    string Body,
    Dictionary<string, object>? Metadata
);

public record CreateNotificationRequest(
    string UserId,
    NotificationType Type,
    NotificationContentDto Content
);

public record GetNotificationsRequest(
    string UserId,
    int Skip = 0,
    int Take = 50
);
