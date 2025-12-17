import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useLogoutMutation } from '@/features/auth/authApi';
import { logout } from '@/features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from '@/components/LanguageSelector';
import { useRTL } from '@/hooks/useRTL';
import { useState } from 'react';
import { useGetDashboardQuery } from '../api/dashboardApi';
import GroupCard from '../components/GroupCard';
import GroupCardSkeleton from '../components/GroupCardSkeleton';
import EmptyGroupsState from '../components/EmptyGroupsState';
import CreateTaskFromGroupModal from '../components/CreateTaskFromGroupModal';
import MemberListModal from '../components/MemberListModal';
import ManageMembersModalWrapper from '../components/ManageMembersModalWrapper';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { isRTL } = useRTL();
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logoutMutation] = useLogoutMutation();

  // Fetch dashboard data from API
  const { data: dashboardData, isLoading, error } = useGetDashboardQuery({ page: 1, pageSize: 12 });

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

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
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : ''}`}>
      {/* Navigation Header - Preserved from original */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">NU</h1>
            </div>
            <div className={isRTL ? 'flex items-center gap-4 flex-row-reverse' : 'flex items-center gap-4'}>
              <LanguageSelector />
              <span className="text-gray-700">
                {user?.firstName} {user?.lastName}
              </span>
              <button onClick={handleLogout} className="btn btn-secondary">
                {t('auth.logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Groups Dashboard */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Page Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 rtl:text-right">
              {t('dashboard.myGroups', { defaultValue: 'My Groups' })}
            </h2>
            <p className="mt-1 text-sm text-gray-600 rtl:text-right">
              {t('dashboard.manageGroups', { defaultValue: 'View and manage your group tasks' })}
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div
              className="rounded-md bg-red-50 p-4 mb-6"
              role="alert"
              aria-live="assertive"
            >
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {t('dashboard.errorTitle', { defaultValue: 'Error loading groups' })}
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      {t('dashboard.errorMessage', { defaultValue: 'Unable to load your groups. Please try again.' })}
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="text-sm font-medium text-red-800 hover:text-red-900 underline"
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
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    aria-label={t('dashboard.loadMore', { defaultValue: 'Load more groups' })}
                  >
                    {t('dashboard.loadMore', { defaultValue: 'Load More Groups' })}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

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
