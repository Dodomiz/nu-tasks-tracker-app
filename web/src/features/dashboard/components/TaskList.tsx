import { useTranslation } from 'react-i18next';
import TaskCard from './TaskCard';
import type { TaskWithGroup } from '@/features/tasks/api/tasksApi';

interface TaskListProps {
  tasks: TaskWithGroup[];
  isLoading: boolean;
  onTaskClick?: (taskId: string) => void;
}

export default function TaskList({ tasks, isLoading, onTaskClick }: TaskListProps) {
  const { t } = useTranslation();

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg
          className="w-16 h-16 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {t('tasks.emptyState.noTasks', { defaultValue: 'No tasks found' })}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('tasks.emptyState.noTasksDescription', {
            defaultValue: 'You don\'t have any tasks assigned at the moment.',
          })}
        </p>
      </div>
    );
  }

  // Task list
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onClick={onTaskClick} showGroupBadge={true} />
      ))}
    </div>
  );
}
