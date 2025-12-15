import { useState, useMemo } from 'react';
import * as HeroIcons from '@heroicons/react/24/outline';
import type { HeroiconName } from '@/types/category';
import { AVAILABLE_ICONS } from '@/types/category';

interface CategoryIconPickerProps {
  value: HeroiconName;
  onChange: (icon: HeroiconName) => void;
  label?: string;
  error?: string;
}

/**
 * Dynamic icon component that renders Heroicons based on name
 */
const DynamicIcon = ({ name, className }: { name: HeroiconName; className?: string }) => {
  const iconKey = name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Icon';
  
  const Icon = (HeroIcons as any)[iconKey];
  
  if (!Icon) {
    return <HeroIcons.EllipsisHorizontalIcon className={className} />;
  }
  
  return <Icon className={className} />;
};

/**
 * Category icon picker component
 * Displays a searchable grid of Heroicons for selection
 * Supports keyboard navigation and visual selection feedback
 */
export const CategoryIconPicker = ({
  value,
  onChange,
  label,
  error,
}: CategoryIconPickerProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter icons based on search query (debounced in input)
  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) return AVAILABLE_ICONS;
    
    const query = searchQuery.toLowerCase();
    return AVAILABLE_ICONS.filter(
      (icon) =>
        icon.name.toLowerCase().includes(query) ||
        icon.label.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      {/* Search input */}
      <div className="mb-3">
        <input
          type="text"
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search icons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Icon grid */}
      <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-3">
        {filteredIcons.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
            No icons found matching "{searchQuery}"
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {filteredIcons.map((icon) => (
              <button
                key={icon.name}
                type="button"
                onClick={() => onChange(icon.name)}
                className={`group relative flex flex-col items-center justify-center p-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                  value === icon.name
                    ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={icon.label}
                aria-label={`Select ${icon.label} icon`}
                aria-pressed={value === icon.name}
              >
                <DynamicIcon
                  name={icon.name}
                  className={`h-6 w-6 transition-colors ${
                    value === icon.name
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100'
                  }`}
                />
                <span className="mt-1 text-xs text-center text-gray-600 dark:text-gray-400 line-clamp-2">
                  {icon.label}
                </span>
                
                {/* Selected indicator */}
                {value === icon.name && (
                  <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected icon preview */}
      <div className="mt-3 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <span className="font-medium">Selected:</span>
        <DynamicIcon name={value} className="h-5 w-5" />
        <span>{AVAILABLE_ICONS.find((i) => i.name === value)?.label || value}</span>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};
