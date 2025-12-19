import { useTranslation } from 'react-i18next';
import { useRTL } from '@/hooks/useRTL';

type TaskStatus = 'Pending' | 'InProgress' | 'Completed' | null;

interface TaskFiltersProps {
  difficulty: number | null;
  status: TaskStatus;
  onFilterChange: (difficulty: number | null, status: TaskStatus) => void;
  onClearFilters: () => void;
}

export default function TaskFilters({
  difficulty,
  status,
  onFilterChange,
  onClearFilters,
}: TaskFiltersProps) {
  const { t } = useTranslation();
  const { isRTL } = useRTL();

  const difficulties = [
    { value: 1, label: t('tasks.difficulty.easy', { defaultValue: 'Easy' }), range: '1-3' },
    { value: 5, label: t('tasks.difficulty.medium', { defaultValue: 'Medium' }), range: '4-7' },
    { value: 9, label: t('tasks.difficulty.hard', { defaultValue: 'Hard' }), range: '8-10' },
  ];

  const statuses: { value: TaskStatus; label: string }[] = [
    { value: 'Pending', label: t('tasks.status.pending', { defaultValue: 'Pending' }) },
    { value: 'InProgress', label: t('tasks.status.inProgress', { defaultValue: 'In Progress' }) },
    { value: 'Completed', label: t('tasks.status.completed', { defaultValue: 'Completed' }) },
  ];

  const handleDifficultyClick = (value: number) => {
    onFilterChange(difficulty === value ? null : value, status);
  };

  const handleStatusClick = (value: TaskStatus) => {
    onFilterChange(difficulty, status === value ? null : value);
  };

  const hasActiveFilters = difficulty !== null || status !== null;

  return (
    <div className={`space-y-4 ${isRTL ? 'rtl' : ''}`}>
      {/* Difficulty Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('tasks.filters.difficulty', { defaultValue: 'Difficulty' })}
        </label>
        <div className="flex flex-wrap gap-2">
          {difficulties.map((diff) => (
            <button
              key={diff.value}
              onClick={() => handleDifficultyClick(diff.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                difficulty === diff.value
                  ? 'bg-blue-500 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {diff.label} ({diff.range})
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('tasks.filters.status', { defaultValue: 'Status' })}
        </label>
        <div className="flex flex-wrap gap-2">
          {statuses.map((stat) => (
            <button
              key={stat.value}
              onClick={() => handleStatusClick(stat.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                status === stat.value
                  ? 'bg-blue-500 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {stat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="pt-2">
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            {t('tasks.filters.clear', { defaultValue: 'Clear All Filters' })}
          </button>
        </div>
      )}
    </div>
  );
}
