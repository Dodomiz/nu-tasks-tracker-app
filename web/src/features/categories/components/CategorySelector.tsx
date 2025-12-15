import { useState, useMemo } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';
import * as HeroIcons from '@heroicons/react/24/outline';
import type { Category, HeroiconName } from '@/types/category';

interface CategorySelectorProps {
  value: string | null;
  onChange: (categoryId: string | null) => void;
  categories: Category[];
  isLoading?: boolean;
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
}

/**
 * Dynamic icon component that renders Heroicons based on name
 */
const CategoryIcon = ({ name, className }: { name: HeroiconName; className?: string }) => {
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
 * Category selector dropdown component
 */
export const CategorySelector = ({
  value,
  onChange,
  categories,
  isLoading = false,
  placeholder = 'Select a category',
  label,
  error,
  required = false,
}: CategorySelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const sortedCategories = useMemo(() => {
    const system = categories.filter((c) => c.isSystemCategory);
    const custom = categories.filter((c) => !c.isSystemCategory);
    return [...system, ...custom];
  }, [categories]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return sortedCategories;
    
    const query = searchQuery.toLowerCase();
    return sortedCategories.filter((category) =>
      category.name.toLowerCase().includes(query)
    );
  }, [sortedCategories, searchQuery]);

  const selectedCategory = categories.find((c) => c.id === value);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <Listbox value={value} onChange={onChange}>
        {({ open }) => (
          <div className="relative">
            <Listbox.Button
              className={`relative w-full cursor-pointer rounded-lg bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm ${
                error ? 'border-2 border-red-500' : 'border border-gray-300 dark:border-gray-600'
              }`}
              aria-label={label || 'Category selector'}
            >
              {isLoading ? (
                <span className="block truncate text-gray-500 dark:text-gray-400">
                  Loading categories...
                </span>
              ) : selectedCategory ? (
                <span className="flex items-center gap-2">
                  <CategoryIcon
                    name={selectedCategory.icon}
                    className="h-5 w-5 flex-shrink-0"
                  />
                  <span className="block truncate">{selectedCategory.name}</span>
                  <span
                    className={`ml-auto inline-block h-3 w-3 rounded-full bg-${selectedCategory.color}`}
                    aria-label={`Color: ${selectedCategory.color}`}
                  />
                </span>
              ) : (
                <span className="block truncate text-gray-500 dark:text-gray-400">
                  {placeholder}
                </span>
              )}
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 px-2 py-2 border-b border-gray-200 dark:border-gray-700">
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {!required && value && (
                  <Listbox.Option
                    value={null}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                        active
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                          : 'text-gray-900 dark:text-gray-100'
                      }`
                    }
                  >
                    <span className="block truncate font-normal">
                      (Clear selection)
                    </span>
                  </Listbox.Option>
                )}

                {filteredCategories.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'No categories found' : 'No categories available'}
                  </div>
                ) : (
                  filteredCategories.map((category) => (
                    <Listbox.Option
                      key={category.id}
                      value={category.id}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                          active
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                            : 'text-gray-900 dark:text-gray-100'
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <div className="flex items-center gap-2">
                            <CategoryIcon
                              name={category.icon}
                              className="h-5 w-5 flex-shrink-0"
                            />
                            <span
                              className={`block truncate ${
                                selected ? 'font-medium' : 'font-normal'
                              }`}
                            >
                              {category.name}
                            </span>
                            {category.isSystemCategory && (
                              <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                                System
                              </span>
                            )}
                            <span
                              className={`inline-block h-3 w-3 rounded-full bg-${category.color}`}
                              aria-label={`Color: ${category.color}`}
                            />
                          </div>
                          {selected && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          )}
                        </>
                      )}
                    </Listbox.Option>
                  ))
                )}
              </Listbox.Options>
            </Transition>
          </div>
        )}
      </Listbox>

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};
