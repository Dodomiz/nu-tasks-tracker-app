import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useGetNotificationsQuery, useMarkAllAsReadMutation } from '../api/notificationsApi';
import { NotificationItem } from './NotificationItem';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const { t } = useTranslation();
  const currentUser = useSelector(selectCurrentUser);
  const [markAllAsRead, { isLoading: isMarkingAllAsRead }] = useMarkAllAsReadMutation();

  const {
    data: notifications = [],
    isLoading,
    isError,
    refetch,
  } = useGetNotificationsQuery(
    { userId: currentUser?.id || '', skip: 0, take: 50 },
    { skip: !currentUser?.id, pollingInterval: 15000 } // Poll every 15 seconds
  );

  const handleMarkAllAsRead = async () => {
    if (!currentUser?.id) return;
    
    try {
      await markAllAsRead(currentUser.id).unwrap();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const hasUnreadNotifications = notifications.some((n) => !n.isRead);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 dark:bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 pt-20">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
                    {t('notifications.title', 'Notifications')}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Mark all as read button */}
                {hasUnreadNotifications && (
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleMarkAllAsRead}
                      disabled={isMarkingAllAsRead}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isMarkingAllAsRead
                        ? t('notifications.markingAllAsRead', 'Marking...')
                        : t('notifications.markAllAsRead', 'Mark all as read')}
                    </button>
                  </div>
                )}

                {/* Notifications list */}
                <div className="max-h-96 overflow-y-auto">
                  {isLoading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  )}

                  {isError && (
                    <div className="p-4 text-center">
                      <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                        {t('notifications.error', 'Failed to load notifications')}
                      </p>
                      <button
                        onClick={() => refetch()}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        {t('notifications.retry', 'Retry')}
                      </button>
                    </div>
                  )}

                  {!isLoading && !isError && notifications.length === 0 && (
                    <div className="p-8 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('notifications.empty', 'No notifications')}
                      </p>
                    </div>
                  )}

                  {!isLoading && !isError && notifications.length > 0 && (
                    <div>
                      {notifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onClose={onClose}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
