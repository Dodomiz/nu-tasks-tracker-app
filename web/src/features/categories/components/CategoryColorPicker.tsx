import type { CategoryColor } from '@/types/category';
import { AVAILABLE_COLORS } from '@/types/category';

interface CategoryColorPickerProps {
  value: CategoryColor;
  onChange: (color: CategoryColor) => void;
  label?: string;
  error?: string;
}

/**
 * Category color picker component
 * Displays a grid of predefined Tailwind colors
 * All colors meet WCAG AA contrast requirements
 */
export const CategoryColorPicker = ({
  value,
  onChange,
  label,
  error,
}: CategoryColorPickerProps) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      {/* Color grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {AVAILABLE_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            className={`group relative flex flex-col items-center justify-center p-3 rounded-lg bg-white dark:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
              value === color.value
                ? 'ring-2 ring-blue-600 dark:ring-blue-400'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            title={color.label}
            aria-label={`Select ${color.label} color`}
            aria-pressed={value === color.value}
          >
            {/* Color circle */}
            <div
              className={`h-8 w-8 rounded-full bg-${color.value} shadow-md`}
              style={{ backgroundColor: color.hex }}
            />
            
            {/* Color name */}
            <span className="mt-2 text-xs text-center text-gray-700 dark:text-gray-300 font-medium">
              {color.label}
            </span>

            {/* Selected indicator */}
            {value === color.value && (
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 dark:bg-blue-400 flex items-center justify-center">
                <svg
                  className="h-3 w-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Selected color info */}
      <div className="mt-3 flex items-center gap-3 text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">Selected:</span>
        <div className="flex items-center gap-2">
          <div
            className={`h-5 w-5 rounded-full bg-${value} shadow`}
            style={{ 
              backgroundColor: AVAILABLE_COLORS.find((c) => c.value === value)?.hex 
            }}
          />
          <span className="text-gray-700 dark:text-gray-300">
            {AVAILABLE_COLORS.find((c) => c.value === value)?.label}
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-xs font-mono">
            {value}
          </span>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};
