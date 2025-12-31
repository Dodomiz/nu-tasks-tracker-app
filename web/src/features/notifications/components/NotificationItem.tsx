import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useMarkAsReadMutation } from '../api/notificationsApi';
import type { NotificationResponse } from '../api/notificationsApi';
import { BellIcon, CheckCircleIcon, UserPlusIcon, UserMinusIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface NotificationItemProps {
  notification: NotificationResponse;
  onClose?: () => void;
}

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const { t, i18n } = useTranslation();
  const [markAsRead] = useMarkAsReadMutation();

  const handleClick = async () => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id).unwrap();
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // Optional: Navigate based on notification type
    const metadata = notification.content.metadata;
    if (metadata?.taskId) {
      // Could navigate to task details
      // navigate(`/tasks/${metadata.taskId}`);
    }

    onClose?.();
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'TASK_ASSIGNED':
      case 'TASK_STATUS_CHANGED':
        return <BellIcon className="h-5 w-5 text-blue-500" />;
      case 'TASK_PENDING_APPROVAL':
        return <CheckCircleIcon className="h-5 w-5 text-amber-500" />;
      case 'GROUP_MEMBER_JOINED':
        return <UserPlusIcon className="h-5 w-5 text-green-500" />;
      case 'GROUP_MEMBER_REMOVED':
        return <UserMinusIcon className="h-5 w-5 text-red-500" />;
      case 'GROUP_INVITATION_RECEIVED':
        return <EnvelopeIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRelativeTime = () => {
    try {
      return formatDistanceToNow(new Date(notification.createdAt), {
        addSuffix: true,
        locale: i18n.language === 'he' ? undefined : undefined, // date-fns locale would go here
      });
    } catch {
      return notification.createdAt;
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        flex items-start gap-3 p-4 cursor-pointer transition-colors
        hover:bg-gray-50 dark:hover:bg-gray-800
        ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10 font-medium' : ''}
        border-b border-gray-200 dark:border-gray-700 last:border-b-0
      `}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-1">
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
          {notification.content.body}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {getRelativeTime()}
        </p>
      </div>

      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="flex-shrink-0">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        </div>
      )}
    </div>
  );
}
