import { useMemo, useState } from 'react';
import type { TaskTemplate } from '@/types/template';

interface TemplatePickerProps {
  templates: TaskTemplate[];
  onSelect: (template: TaskTemplate) => void;
  selectedTemplateId?: string;
  categories?: Array<{ id: string; name: string }>;
  showFilters?: boolean;
}

/**
 * Component for selecting task templates with search and filter capabilities
 */
export function TemplatePicker({
  templates,
  onSelect,
  selectedTemplateId,
  categories = [],
  showFilters = true,
}: TemplatePickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [difficultyRange, setDifficultyRange] = useState<[number, number]>([1, 10]);

  // Filter templates based on search and filters
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      // Search filter (case-insensitive)
      const matchesSearch =
        !searchTerm ||
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory =
        !selectedCategoryId || template.categoryId === selectedCategoryId;

      // Difficulty filter
      const matchesDifficulty =
        template.difficultyLevel >= difficultyRange[0] &&
        template.difficultyLevel <= difficultyRange[1];

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [templates, searchTerm, selectedCategoryId, difficultyRange]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategoryId('');
    setDifficultyRange([1, 10]);
  };

  const hasActiveFilters =
    searchTerm || selectedCategoryId || difficultyRange[0] !== 1 || difficultyRange[1] !== 10;

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      {showFilters && (
        <div className="space-y-3">
          {/* Search Input */}
          <div>
            <label htmlFor="template-search" className="sr-only">
              Search templates
            </label>
            <input
              id="template-search"
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Category Filter */}
            <div className="flex-1">
              <label htmlFor="category-filter" className="sr-only">
                Filter by category
              </label>
              <select
                id="category-filter"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Range */}
            <div className="flex-1">
              <label htmlFor="difficulty-range" className="sr-only">
                Filter by difficulty
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Difficulty:</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={difficultyRange[0]}
                  onChange={(e) =>
                    setDifficultyRange([parseInt(e.target.value) || 1, difficultyRange[1]])
                  }
                  className="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={difficultyRange[1]}
                  onChange={(e) =>
                    setDifficultyRange([difficultyRange[0], parseInt(e.target.value) || 10])
                  }
                  className="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm"
                />
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Template List */}
      <div className="max-h-96 space-y-4 overflow-y-auto rounded-lg border border-gray-200 p-4">
        {filteredTemplates.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            {hasActiveFilters ? 'No templates match your filters' : 'No templates available'}
          </div>
        ) : (
          <>
            {/* System Templates */}
            {filteredTemplates.some((t) => t.isSystemTemplate) && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-700">System Templates</h4>
                <div className="space-y-2">
                  {filteredTemplates
                    .filter((t) => t.isSystemTemplate)
                    .map((template) => (
                      <TemplateItem
                        key={template.id}
                        template={template}
                        isSelected={template.id === selectedTemplateId}
                        onSelect={() => onSelect(template)}
                        categories={categories}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Group Templates */}
            {filteredTemplates.some((t) => !t.isSystemTemplate) && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-700">Custom Templates</h4>
                <div className="space-y-2">
                  {filteredTemplates
                    .filter((t) => !t.isSystemTemplate)
                    .map((template) => (
                      <TemplateItem
                        key={template.id}
                        template={template}
                        isSelected={template.id === selectedTemplateId}
                        onSelect={() => onSelect(template)}
                        categories={categories}
                      />
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Results Count */}
      {filteredTemplates.length > 0 && (
        <div className="text-sm text-gray-600">
          Showing {filteredTemplates.length} of {templates.length} templates
        </div>
      )}
    </div>
  );
}

interface TemplateItemProps {
  template: TaskTemplate;
  isSelected: boolean;
  onSelect: () => void;
  categories: Array<{ id: string; name: string }>;
}

function TemplateItem({ template, isSelected, onSelect, categories }: TemplateItemProps) {
  const categoryName = categories.find((c) => c.id === template.categoryId)?.name;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-lg border p-3 text-left transition-colors ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h5 className="font-medium text-gray-900">{template.name}</h5>
            {template.isSystemTemplate && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                System
              </span>
            )}
          </div>
          {template.description && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{template.description}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
            {categoryName && (
              <span className="rounded bg-gray-100 px-2 py-0.5">{categoryName}</span>
            )}
            <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-700">
              Difficulty: {template.difficultyLevel}
            </span>
            {template.estimatedDurationMinutes && (
              <span className="rounded bg-purple-100 px-2 py-0.5 text-purple-700">
                ~{template.estimatedDurationMinutes} min
              </span>
            )}
            <span className="rounded bg-green-100 px-2 py-0.5 text-green-700">
              {template.defaultFrequency}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
