import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/Modal';
import CreateTaskForm from '@/components/CreateTaskForm';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { addToast } from '@/app/slices/notificationsSlice';
import type { GroupCardDto } from '@/types/dashboard';
import { updateGroup, setCurrentGroup } from '@/features/groups/groupSlice';
import type { Group } from '@/types/group';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  group: GroupCardDto;
}

export default function CreateTaskFromGroupModal({ isOpen, onClose, group }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // Prepare group data for CreateTaskForm (it expects group in Redux state)
  // This is a temporary workaround until we have proper group detail API
  useEffect(() => {
    if (isOpen) {
      // Convert GroupCardDto to Group format for Redux
      const groupData: Group = {
        id: group.id,
        name: group.name,
        description: group.description || '',
        timezone: 'UTC', // Default, not used by form
        language: 'en', // Default, not used by form
        memberCount: group.memberCount,
        myRole: group.myRole === 'Admin' ? 'Admin' : 'RegularUser',
        // Combine admins and recent members for the form
        members: [
          ...group.admins.map((admin) => ({
            userId: admin.userId,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: '', // Not available in dashboard data, will be fetched from group details API later
            avatarUrl: admin.avatarUrl || undefined,
            role: 'Admin' as const,
            joinedAt: admin.joinedAt,
          })),
          ...group.recentMembers.map((member) => ({
            userId: member.userId,
            firstName: member.firstName,
            lastName: member.lastName,
            email: '', // Not available in dashboard data, will be fetched from group details API later
            avatarUrl: member.avatarUrl || undefined,
            role: 'RegularUser' as const,
            joinedAt: member.joinedAt,
          })),
        ],
        createdAt: new Date().toISOString(), // Not used by form
      };

      // Update group in Redux store
      dispatch(updateGroup(groupData));
      // Set as current group
      dispatch(setCurrentGroup(group.id));
    }
  }, [isOpen, group, dispatch]);

  const handleSuccess = () => {
    dispatch(
      addToast({
        id: Date.now().toString(),
        message: t('dashboard.taskCreated', { defaultValue: 'Task created successfully' }),
        type: 'success',
      })
    );
    onClose();
    // TODO: Invalidate dashboard cache to refresh task count
  };

  const handleError = (msg?: string) => {
    dispatch(
      addToast({
        id: Date.now().toString(),
        message: msg || t('dashboard.taskCreateError', { defaultValue: 'Failed to create task' }),
        type: 'error',
      })
    );
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t('dashboard.createTaskInGroup', {
        defaultValue: 'Create Task in {{groupName}}',
        groupName: group.name,
      })}
    >
      <div className="space-y-4">
        {/* Group Context Banner */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                {group.name}
              </h4>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                {t('dashboard.taskWillBeCreatedIn', {
                  defaultValue: 'This task will be created in this group and can be assigned to any member.',
                })}
              </p>
              <div className="mt-2 flex items-center gap-4 text-xs text-blue-600 dark:text-blue-400">
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  {t('dashboard.memberCount', { count: group.memberCount, defaultValue: '{{count}} members' })}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t('dashboard.taskCount', { count: group.taskCount, defaultValue: '{{count}} tasks' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Task Creation Form */}
        <CreateTaskForm
          defaultGroupId={group.id}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </Modal>
  );
}
