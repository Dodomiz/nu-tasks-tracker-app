import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useRTL } from '@/hooks/useRTL';
import TaskFilters from './TaskFilters';
import TaskSort from './TaskSort';
import TaskList from './TaskList';
import { useGetMyTasksQuery } from '@/features/tasks/api/tasksApi';
import { FunnelIcon } from '@heroicons/react/24/outline';

type TaskStatus = 'Pending' | 'InProgress' | 'Completed' | null;

export default function MyTasksTab() {
  const { t } = useTranslation();
  const { isRTL } = useRTL();
  const [searchParams, setSearchParams] = useSearchParams();

  // State from URL params
  const [difficulty, setDifficulty] = useState<number | null>(() => {
    const param = searchParams.get('difficulty');
    return param ? parseInt(param, 10) : null;
  });

  const [status, setStatus] = useState<TaskStatus>(() => {
    const param = searchParams.get('status');
    return (param as TaskStatus) || null;
  });

  const [sortBy, setSortBy] = useState<'difficulty' | 'status' | 'dueDate'>(() => {
    const param = searchParams.get('sortBy');
    return (param as 'difficulty' | 'status' | 'dueDate') || 'dueDate';
  });

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() => {
    const param = searchParams.get('sortOrder');
    return (param as 'asc' | 'desc') || 'asc';
  });

  const [showFilters, setShowFilters] = useState(false);

  // Fetch tasks with current filters
  const { data, isLoading, error } = useGetMyTasksQuery({
    difficulty: difficulty ?? undefined,
    status: status ?? undefined,
    sortBy,
    sortOrder,
    page: 1,
    pageSize: 100,
  });

  // Update URL params when filters change
  useEffect(() => {
    const params: Record<string, string> = {};
    if (difficulty !== null) params.difficulty = difficulty.toString();
    if (status !== null) params.status = status;
    params.sortBy = sortBy;
    params.sortOrder = sortOrder;
    setSearchParams(params, { replace: true });
  }, [difficulty, status, sortBy, sortOrder, setSearchParams]);

  const handleFilterChange = (newDifficulty: number | null, newStatus: TaskStatus) => {
    setDifficulty(newDifficulty);
    setStatus(newStatus);
  };

  const handleClearFilters = () => {
    setDifficulty(null);
    setStatus(null);
  };

  const handleSortChange = (field: string, order: string) => {
    setSortBy(field as 'difficulty' | 'status' | 'dueDate');
    setSortOrder(order as 'asc' | 'desc');
  };

  const handleTaskClick = (taskId: string) => {
    // Future: Navigate to task detail page or open modal
    console.log('Task clicked:', taskId);
  };

  const hasActiveFilters = difficulty !== null || status !== null;

  return (
    <div className={`${isRTL ? 'rtl' : ''}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {t('dashboard.myTasks', { defaultValue: 'My Tasks' })}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {t('dashboard.myTasksDescription', {
            defaultValue: 'View and manage all your tasks across groups',
          })}
        </p>
      </div>

      {/* Controls Bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Filter Toggle Button (Mobile) */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <FunnelIcon className="h-5 w-5 mr-2" />
          {t('tasks.filters.title', { defaultValue: 'Filters' })}
          {hasActiveFilters && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-blue-500 rounded-full">
              {(difficulty ? 1 : 0) + (status ? 1 : 0)}
            </span>
          )}
        </button>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-gray-900">
            {t('tasks.sort.label', { defaultValue: 'Sort by:' })}
          </label>
          <TaskSort sortBy={sortBy} sortOrder={sortOrder} onSortChange={handleSortChange} />
        </div>
      </div>

      {/* Filter Panel (Desktop always visible, Mobile collapsible) */}
      <div className={`mb-6 ${showFilters ? 'block' : 'hidden md:block'}`}>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <TaskFilters
            difficulty={difficulty}
            status={status}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-800 font-medium">
              {t('tasks.error.loadFailed', {
                defaultValue: 'Failed to load tasks. Please try again.',
              })}
            </p>
          </div>
        </div>
      )}

      {/* Task Count */}
      {!isLoading && data && (
        <div className="mb-4 px-3 py-2 bg-blue-100 rounded-full inline-block">
          <span className="text-sm font-medium text-blue-800">
            {t('tasks.count', {
              count: data.items.length,
              total: data.total,
              defaultValue: `Showing ${data.items.length} of ${data.total} tasks`,
            })}
          </span>
        </div>
      )}

      {/* Task List */}
      <TaskList tasks={data?.items || []} isLoading={isLoading} onTaskClick={handleTaskClick} />
    </div>
  );
}
