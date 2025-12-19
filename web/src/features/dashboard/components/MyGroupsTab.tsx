import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useGetDashboardQuery } from '../api/dashboardApi';
import GroupCard from './GroupCard';
import GroupCardSkeleton from './GroupCardSkeleton';
import EmptyGroupsState from './EmptyGroupsState';
import CreateTaskFromGroupModal from './CreateTaskFromGroupModal';
import MemberListModal from './MemberListModal';
import ManageMembersModalWrapper from './ManageMembersModalWrapper';

export default function MyGroupsTab() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  // Fetch dashboard data from API
  const { data: dashboardData, isLoading, error } = useGetDashboardQuery({ page: 1, pageSize: 12 });

  const [selectedGroupForTask, setSelectedGroupForTask] = useState<string | null>(null);
  const [selectedGroupForMembers, setSelectedGroupForMembers] = useState<string | null>(null);
  const [selectedGroupForManageMembers, setSelectedGroupForManageMembers] = useState<string | null>(null);

  const handleCreateTask = (groupId: string) => {
    setSelectedGroupForTask(groupId);
  };

  const handleManageMembers = (groupId: string) => {
    setSelectedGroupForManageMembers(groupId);
  };

  const handleEditGroup = (groupId: string) => {
    // Navigate to group dashboard where settings can be accessed
    navigate(`/groups/${groupId}/dashboard`);
  };

  const handleViewMembers = (groupId: string) => {
    setSelectedGroupForMembers(groupId);
  };

  const selectedGroup = dashboardData?.groups.find((g) => g.id === selectedGroupForTask);
  const selectedGroupForMemberList = dashboardData?.groups.find((g) => g.id === selectedGroupForMembers);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white rtl:text-right">
            {t('dashboard.myGroups', { defaultValue: 'My Groups' })}
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 rtl:text-right">
            {t('dashboard.manageGroups', { defaultValue: 'View and manage your group tasks' })}
          </p>
        </div>
        {/* Action buttons */}
        {!isLoading && !error && dashboardData && dashboardData.groups.length > 0 && (
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/groups/join')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              title="Join a group with an invitation code"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {t('dashboard.joinWithCode', { defaultValue: 'Join Group' })}
            </button>
            <button
              onClick={() => navigate('/groups/create')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              {t('dashboard.createGroup', { defaultValue: 'Create Group' })}
            </button>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div
          className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 mb-6 border border-red-200 dark:border-red-800"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                {t('dashboard.errorTitle', { defaultValue: 'Error loading groups' })}
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>
                  {t('dashboard.errorMessage', { defaultValue: 'Unable to load your groups. Please try again.' })}
                </p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="text-sm font-medium text-red-800 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100 underline"
                >
                  {t('common.retry', { defaultValue: 'Retry' })}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !error && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="status"
          aria-label={t('dashboard.loading', { defaultValue: 'Loading groups' })}
        >
          {[1, 2, 3].map((i) => (
            <GroupCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && dashboardData && dashboardData.groups.length === 0 && (
        <EmptyGroupsState />
      )}

      {/* Groups Grid */}
      {!isLoading && !error && dashboardData && dashboardData.groups.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData.groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onCreateTask={handleCreateTask}
                onManageMembers={handleManageMembers}
                onEditGroup={handleEditGroup}
                onViewMembers={handleViewMembers}
              />
            ))}
          </div>

          {/* Load More Indicator (for future infinite scroll) */}
          {dashboardData.hasMore && (
            <div className="mt-6 text-center">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                aria-label={t('dashboard.loadMore', { defaultValue: 'Load more groups' })}
              >
                {t('dashboard.loadMore', { defaultValue: 'Load More Groups' })}
              </button>
            </div>
          )}
        </>
      )}

      {/* Task Creation Modal */}
      {selectedGroup && (
        <CreateTaskFromGroupModal
          isOpen={selectedGroupForTask !== null}
          onClose={() => setSelectedGroupForTask(null)}
          group={selectedGroup}
        />
      )}

      {/* Member List Modal */}
      {selectedGroupForMemberList && (
        <MemberListModal
          isOpen={selectedGroupForMembers !== null}
          onClose={() => setSelectedGroupForMembers(null)}
          group={selectedGroupForMemberList}
          currentUserRole={selectedGroupForMemberList.myRole}
        />
      )}

      {/* Manage Members Modal */}
      {selectedGroupForManageMembers && (
        <ManageMembersModalWrapper
          groupId={selectedGroupForManageMembers}
          currentUserId={user?.id || ''}
          onClose={() => setSelectedGroupForManageMembers(null)}
        />
      )}
    </div>
  );
}
