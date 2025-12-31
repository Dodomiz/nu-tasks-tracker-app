import { useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useGetUnreadCountQuery } from '../api/notificationsApi';
import { NotificationModal } from './NotificationModal';

export function NotificationBell() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentUser = useSelector(selectCurrentUser);

  const { data: unreadCount = 0 } = useGetUnreadCountQuery(currentUser?.id || '', {
    skip: !currentUser?.id,
    pollingInterval: 30000, // Poll every 30 seconds
  });

  const handleBellClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Notifications"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white bg-amber-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
}
