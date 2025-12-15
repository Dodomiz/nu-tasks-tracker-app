import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useGetCategoriesQuery } from '@/features/categories/api/categoryApi';
import {
  useGetTemplatesQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
} from '../api/templateApi';
import { TemplateForm } from '../components/TemplateForm';
import { DeleteTemplateModal } from '../components/DeleteTemplateModal';
import type { TaskTemplate, CreateTemplateRequest, UpdateTemplateRequest } from '@/types/template';

type ViewMode = 'list' | 'create' | 'edit';

/**
 * Template Management page for admins
 * Allows viewing, creating, editing, and deleting group-specific templates
 */
export function TemplateManagement() {
  const { groupId } = useParams<{ groupId: string }>();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<TaskTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [difficultyRange, setDifficultyRange] = useState<[number, number]>([1, 10]);

  // API hooks
  const { data: templates = [], isLoading, error } = useGetTemplatesQuery({ groupId: groupId! });
  const { data: categories = [] } = useGetCategoriesQuery({ groupId: groupId! });
  const [createTemplate, { isLoading: isCreating }] = useCreateTemplateMutation();
  const [updateTemplate, { isLoading: isUpdating }] = useUpdateTemplateMutation();
  const [deleteTemplate, { isLoading: isDeleting }] = useDeleteTemplateMutation();

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      // Search filter
      if (searchQuery && !template.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategoryId && template.categoryId !== selectedCategoryId) {
        return false;
      }

      // Difficulty range filter
      if (
        template.difficultyLevel < difficultyRange[0] ||
        template.difficultyLevel > difficultyRange[1]
      ) {
        return false;
      }

      return true;
    });
  }, [templates, searchQuery, selectedCategoryId, difficultyRange]);

  // Separate system and group templates
  const systemTemplates = filteredTemplates.filter((t) => t.isSystemTemplate);
  const groupTemplates = filteredTemplates.filter((t) => !t.isSystemTemplate);

  // Handlers
  const handleCreateTemplate = async (data: CreateTemplateRequest) => {
    try {
      await createTemplate({ groupId: groupId!, ...data }).unwrap();
      setViewMode('list');
      // Show success notification (could integrate toast library)
      alert('Template created successfully!');
    } catch (error) {
      console.error('Failed to create template:', error);
      alert('Failed to create template. Please try again.');
    }
  };

  const handleUpdateTemplate = async (data: UpdateTemplateRequest) => {
    if (!selectedTemplate) return;

    try {
      await updateTemplate({
        groupId: groupId!,
        id: selectedTemplate.id,
        ...data,
      }).unwrap();
      setViewMode('list');
      setSelectedTemplate(null);
      alert('Template updated successfully!');
    } catch (error) {
      console.error('Failed to update template:', error);
      alert('Failed to update template. Please try again.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;

    try {
      await deleteTemplate({
        groupId: groupId!,
        id: templateToDelete.id,
      }).unwrap();
      setTemplateToDelete(null);
      alert('Template deleted successfully!');
    } catch (error) {
      console.error('Failed to delete template:', error);
      alert('Failed to delete template. Please try again.');
    }
  };

  const handleEdit = (template: TaskTemplate) => {
    setSelectedTemplate(template);
    setViewMode('edit');
  };

  const handleCancelForm = () => {
    setViewMode('list');
    setSelectedTemplate(null);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategoryId('');
    setDifficultyRange([1, 10]);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 mx-auto text-blue-600"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="mt-4 text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Templates</h2>
          <p className="text-red-700">
            Failed to load templates. Please refresh the page or try again later.
          </p>
        </div>
      </div>
    );
  }

  // Form views
  if (viewMode === 'create') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create Custom Template</h1>
          <p className="text-gray-600 mt-2">
            Add a new template to your group's library for faster task creation.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <TemplateForm
            groupId={groupId!}
            onSubmit={handleCreateTemplate}
            onCancel={handleCancelForm}
            isSubmitting={isCreating}
            mode="create"
          />
        </div>
      </div>
    );
  }

  if (viewMode === 'edit' && selectedTemplate) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedTemplate.isSystemTemplate ? 'View Template' : 'Edit Template'}
          </h1>
          <p className="text-gray-600 mt-2">
            {selectedTemplate.isSystemTemplate
              ? 'System templates are read-only and cannot be modified.'
              : 'Update the template details below.'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <TemplateForm
            groupId={groupId!}
            template={selectedTemplate}
            onSubmit={handleUpdateTemplate}
            onCancel={handleCancelForm}
            isSubmitting={isUpdating}
            mode="edit"
          />
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Templates</h1>
            <p className="text-gray-600 mt-2">
              Browse and manage task templates for your group
            </p>
          </div>
          <button
            onClick={() => setViewMode('create')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Custom Template
          </button>
        </div>

        {/* Template count */}
        <div className="text-sm text-gray-600">
          {systemTemplates.length} system templates, {groupTemplates.length} custom templates
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty: {difficultyRange[0]}-{difficultyRange[1]}
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="range"
                min="1"
                max="10"
                value={difficultyRange[0]}
                onChange={(e) =>
                  setDifficultyRange([
                    parseInt(e.target.value),
                    Math.max(parseInt(e.target.value), difficultyRange[1]),
                  ])
                }
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <input
                type="range"
                min="1"
                max="10"
                value={difficultyRange[1]}
                onChange={(e) =>
                  setDifficultyRange([
                    Math.min(difficultyRange[0], parseInt(e.target.value)),
                    parseInt(e.target.value),
                  ])
                }
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Clear filters */}
        {(searchQuery || selectedCategoryId || difficultyRange[0] !== 1 || difficultyRange[1] !== 10) && (
          <button
            onClick={clearFilters}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Templates list */}
      <div className="space-y-6">
        {/* System templates */}
        {systemTemplates.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">System Templates</h2>
            <div className="bg-white rounded-lg shadow-md divide-y">
              {systemTemplates.map((template) => (
                <TemplateListItem
                  key={template.id}
                  template={template}
                  onEdit={handleEdit}
                  onDelete={setTemplateToDelete}
                  categories={categories}
                />
              ))}
            </div>
          </div>
        )}

        {/* Group templates */}
        {groupTemplates.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Custom Templates</h2>
            <div className="bg-white rounded-lg shadow-md divide-y">
              {groupTemplates.map((template) => (
                <TemplateListItem
                  key={template.id}
                  template={template}
                  onEdit={handleEdit}
                  onDelete={setTemplateToDelete}
                  categories={categories}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {filteredTemplates.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategoryId || difficultyRange[0] !== 1 || difficultyRange[1] !== 10
                ? 'Try adjusting your filters to see more templates.'
                : 'Get started by creating your first custom template.'}
            </p>
            {!searchQuery && !selectedCategoryId && (
              <button
                onClick={() => setViewMode('create')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Template
              </button>
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {templateToDelete && (
        <DeleteTemplateModal
          template={templateToDelete}
          isOpen={!!templateToDelete}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setTemplateToDelete(null)}
        />
      )}
    </div>
  );
}

// Template list item component
interface TemplateListItemProps {
  template: TaskTemplate;
  onEdit: (template: TaskTemplate) => void;
  onDelete: (template: TaskTemplate) => void;
  categories: Array<{ id: string; name: string }>;
}

function TemplateListItem({ template, onEdit, onDelete, categories }: TemplateListItemProps) {
  const category = categories.find((c) => c.id === template.categoryId);

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{template.name}</h3>
            {template.isSystemTemplate && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                System
              </span>
            )}
          </div>
          
          {template.description && (
            <p className="text-gray-600 mb-3 line-clamp-2">{template.description}</p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {category && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                {category.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Difficulty: {template.difficultyLevel}/10
            </span>
            {template.estimatedDurationMinutes && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {template.estimatedDurationMinutes} min
              </span>
            )}
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {template.defaultFrequency}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(template)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title={template.isSystemTemplate ? 'View template' : 'Edit template'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
          {!template.isSystemTemplate && (
            <button
              onClick={() => onDelete(template)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete template"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
