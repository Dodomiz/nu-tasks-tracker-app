import { useForm } from 'react-hook-form';
import { useGetCategoriesQuery } from '@/features/categories/api/categoryApi';
import type { TaskTemplate, CreateTemplateRequest, UpdateTemplateRequest, TaskFrequency } from '@/types/template';

interface TemplateFormProps {
  groupId: string;
  template?: TaskTemplate;
  onSubmit: (data: CreateTemplateRequest | UpdateTemplateRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit';
}

interface TemplateFormData {
  name: string;
  description: string;
  categoryId: string;
  difficultyLevel: number;
  estimatedDurationMinutes: number;
  defaultFrequency: TaskFrequency;
}

/**
 * Form component for creating or editing task templates
 * Supports both create and edit modes with validation
 */
export function TemplateForm({
  groupId,
  template,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = 'create',
}: TemplateFormProps) {
  const { data: categories = [], isLoading: isCategoriesLoading } = useGetCategoriesQuery({ groupId });
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TemplateFormData>({
    defaultValues: template
      ? {
          name: template.name,
          description: template.description || '',
          categoryId: template.categoryId || '',
          difficultyLevel: template.difficultyLevel,
          estimatedDurationMinutes: template.estimatedDurationMinutes || 30,
          defaultFrequency: template.defaultFrequency || 'Weekly',
        }
      : {
          name: '',
          description: '',
          categoryId: '',
          difficultyLevel: 5,
          estimatedDurationMinutes: 30,
          defaultFrequency: 'Weekly',
        },
  });

  const difficultyLevel = watch('difficultyLevel');
  const isReadOnly = template?.isSystemTemplate;

  const handleFormSubmit = async (data: TemplateFormData) => {
    await onSubmit(data);
  };

  if (isReadOnly) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              System Template (Read-Only)
            </h3>
            <p className="text-yellow-800">
              System templates cannot be edited. They are provided globally and are read-only to
              ensure consistency across all groups. You can create a custom template based on this
              one instead.
            </p>
            <button
              type="button"
              onClick={onCancel}
              className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Name field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Template Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          {...register('name', {
            required: 'Template name is required',
            maxLength: {
              value: 100,
              message: 'Name must be 100 characters or less',
            },
          })}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., Clean Kitchen"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      {/* Description field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Detailed description of the task..."
        />
      </div>

      {/* Category field */}
      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          id="categoryId"
          {...register('categoryId')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isCategoriesLoading}
        >
          <option value="">No Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {isCategoriesLoading && (
          <p className="mt-1 text-sm text-gray-500">Loading categories...</p>
        )}
      </div>

      {/* Difficulty level slider */}
      <div>
        <label htmlFor="difficultyLevel" className="block text-sm font-medium text-gray-700 mb-2">
          Difficulty Level: <span className="font-bold text-blue-600">{difficultyLevel}</span>
        </label>
        <input
          id="difficultyLevel"
          type="range"
          min="1"
          max="10"
          {...register('difficultyLevel', {
            valueAsNumber: true,
            min: { value: 1, message: 'Minimum difficulty is 1' },
            max: { value: 10, message: 'Maximum difficulty is 10' },
          })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Easy (1)</span>
          <span>Medium (5)</span>
          <span>Hard (10)</span>
        </div>
        {errors.difficultyLevel && (
          <p className="mt-1 text-sm text-red-600">{errors.difficultyLevel.message}</p>
        )}
      </div>

      {/* Estimated duration */}
      <div>
        <label
          htmlFor="estimatedDurationMinutes"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Estimated Duration (minutes)
        </label>
        <input
          id="estimatedDurationMinutes"
          type="number"
          min="1"
          step="5"
          {...register('estimatedDurationMinutes', {
            valueAsNumber: true,
            min: { value: 1, message: 'Duration must be at least 1 minute' },
          })}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.estimatedDurationMinutes ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="30"
        />
        {errors.estimatedDurationMinutes && (
          <p className="mt-1 text-sm text-red-600">{errors.estimatedDurationMinutes.message}</p>
        )}
      </div>

      {/* Default frequency */}
      <div>
        <label htmlFor="defaultFrequency" className="block text-sm font-medium text-gray-700 mb-2">
          Default Frequency
        </label>
        <select
          id="defaultFrequency"
          {...register('defaultFrequency')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="OneTime">One Time</option>
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="BiWeekly">Bi-Weekly</option>
          <option value="Monthly">Monthly</option>
          <option value="Quarterly">Quarterly</option>
          <option value="Yearly">Yearly</option>
        </select>
      </div>

      {/* Form actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </span>
          ) : (
            <>{mode === 'create' ? 'Create Template' : 'Update Template'}</>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
