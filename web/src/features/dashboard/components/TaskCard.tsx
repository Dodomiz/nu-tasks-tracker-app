import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { enUS, he } from 'date-fns/locale';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useUpdateTaskStatusMutation } from '@/features/tasks/api/tasksApi';
import type { TaskWithGroup } from '@/features/tasks/api/tasksApi';

interface TaskCardProps {
  task: TaskWithGroup;
  onClick?: (taskId: string) => void;
  showGroupBadge?: boolean;
}

export default function TaskCard({ task, onClick, showGroupBadge = true }: TaskCardProps) {
  const { t } = useTranslation();
  const currentLang = useAppSelector((state) => state.language.current);
  const locale = currentLang === 'he' ? he : enUS;
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [updateTaskStatus, { isLoading: isUpdatingStatus }] = useUpdateTaskStatusMutation();

  const getDifficultyColor = (difficulty: number): string => {
    if (difficulty <= 3) return 'bg-green-100 text-green-800';
    if (difficulty <= 7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      case 'InProgress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const dueDate = new Date(task.dueAt);
  const isOverdue = task.isOverdue;
  const dueText = formatDistanceToNow(dueDate, { addSuffix: true, locale });

  const statuses: Array<'Pending' | 'InProgress' | 'Completed' | 'Overdue'> = [
    'Pending',
    'InProgress',
    'Completed',
    'Overdue',
  ];

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowStatusDropdown(!showStatusDropdown);
  };

  const handleStatusChange = async (newStatus: typeof statuses[number]) => {
    if (newStatus === task.status) {
      setShowStatusDropdown(false);
      return;
    }

    try {
      await updateTaskStatus({ taskId: task.id, status: newStatus }).unwrap();
      setShowStatusDropdown(false);
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(task.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={`p-5 bg-white rounded-lg border border-gray-200 transition-shadow hover:shadow-lg ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Header with Group Badge */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-900 flex-1 leading-tight">{task.name}</h3>
        {showGroupBadge && (
          <span className="ml-2 px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
            {task.groupName}
          </span>
        )}
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Badges Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Difficulty Badge */}
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getDifficultyColor(task.difficulty)}`}>
          {t('common.difficulty', { defaultValue: 'Difficulty' })}: {task.difficulty}/10
        </span>

        {/* Status Badge - Clickable with Dropdown */}
        <div className="relative">
          <button
            onClick={handleStatusClick}
            disabled={isUpdatingStatus}
            className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)} flex items-center gap-1 transition-colors ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-80 cursor-pointer'}`}
            aria-label={t('tasks.status.changeLabel', { defaultValue: 'Change status' })}
          >
            {isUpdatingStatus ? (
              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                {t(`tasks.status.${task.status.toLowerCase()}`, { defaultValue: task.status })}
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>

          {/* Status Dropdown */}
          {showStatusDropdown && !isUpdatingStatus && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowStatusDropdown(false)}
              />
              <div className="absolute z-20 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-100 transition-colors ${
                      status === task.status ? 'bg-blue-50 font-medium' : ''
                    }`}
                  >
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getStatusColor(status).split(' ')[0]}`}></span>
                    {t(`tasks.status.${status.toLowerCase()}`, { defaultValue: status })}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Due Date */}
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            isOverdue
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {isOverdue
            ? t('tasks.overdue', { defaultValue: 'Overdue' }) + ' ' + dueText
            : t('tasks.due', { defaultValue: 'Due' }) + ' ' + dueText}
        </span>
      </div>
    </div>
  );
}
