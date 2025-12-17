import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { GroupCardDto } from '@/types/dashboard';
import MemberAvatarStack from './MemberAvatarStack';
import { formatDistanceToNow } from 'date-fns';
import { enUS, he } from 'date-fns/locale';
import { useAppSelector } from '@/hooks/useAppSelector';
import { PencilIcon } from '@heroicons/react/24/outline';

interface GroupCardProps {
  group: GroupCardDto;
  onCreateTask: (groupId: string) => void;
  onManageMembers: (groupId: string) => void;
  onEditGroup: (groupId: string) => void;
  onViewMembers?: (groupId: string) => void;
}

export default function GroupCard({
  group,
  onCreateTask,
  onManageMembers,
  onEditGroup,
  onViewMembers,
}: GroupCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentLang = useAppSelector((state) => state.language.current);
  const isAdmin = group.myRole === 'Admin';
  
  const locale = currentLang === 'he' ? he : enUS;
  const lastActivityText = formatDistanceToNow(new Date(group.lastActivity), {
    addSuffix: true,
    locale,
  });

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <article
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 flex flex-col h-full border border-gray-200"
      role="article"
      aria-label={`${group.name} group card`}
    >
      {/* Header */}
      <div className="mb-4 relative">
        <div
          className="text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors text-left w-full focus:outline-none focus:ring-2 focus:ring-primary-500 rounded pr-8"
          title={group.name}
        >
          {truncateText(group.name, 50)}
        </div>

        {isAdmin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditGroup(group.id);
            }}
            className="absolute top-0 right-0 p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded transition-colors"
            aria-label={`Edit ${group.name}`}
            title={t('dashboard.editGroup', { defaultValue: 'Edit Group' })}
          >
            <PencilIcon className="w-5 h-5" />
          </button>
        )}
        
        {group.description && (
          <p className="mt-2 text-sm text-gray-600" title={group.description}>
            {truncateText(group.description, 100)}
          </p>
        )}
      </div>

      {/* Stats Badges */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
          aria-label={`${group.memberCount} members`}
        >
          <svg
            className="w-4 h-4 mr-1.5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          {group.memberCount} {t('common.members', { count: group.memberCount, defaultValue: 'members' })}
        </span>

        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
          aria-label={`${group.taskCount} tasks`}
        >
          <svg
            className="w-4 h-4 mr-1.5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
          {group.taskCount} {t('common.tasks', { count: group.taskCount, defaultValue: 'tasks' })}
        </span>
      </div>

      {/* Member Avatars */}
      <div className="mb-4">
        <MemberAvatarStack
          admins={group.admins}
          members={group.recentMembers}
          maxVisible={8}
          onViewAll={onViewMembers ? () => onViewMembers(group.id) : undefined}
        />
      </div>

      {/* Last Activity */}
      <div className="mt-auto mb-4">
        <p className="text-xs text-gray-500" aria-label={`Last activity ${lastActivityText}`}>
          <svg
            className="w-3 h-3 inline mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          {lastActivityText}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onCreateTask(group.id)}
          className="flex-1 min-w-[120px] px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors text-sm"
          aria-label={`Create task in ${group.name}`}
        >
          <svg
            className="w-4 h-4 inline mr-1.5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          {t('dashboard.createTask', { defaultValue: 'Create Task' })}
        </button>

        {isAdmin && (
          <button
            onClick={() => onManageMembers(group.id)}
            className="flex-1 min-w-[140px] px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm"
            aria-label={`Manage members of ${group.name}`}
          >
            <svg
              className="w-4 h-4 inline mr-1.5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            {t('dashboard.manageMembers', { defaultValue: 'Manage Members' })}
          </button>
        )}
      </div>
    </article>
  );
}
