import { useTranslation } from 'react-i18next';
import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

type SortOption = {
  field: 'difficulty' | 'status' | 'dueDate';
  order: 'asc' | 'desc';
  label: string;
};

interface TaskSortProps {
  sortBy: 'difficulty' | 'status' | 'dueDate';
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: string, order: string) => void;
}

export default function TaskSort({ sortBy, sortOrder, onSortChange }: TaskSortProps) {
  const { t } = useTranslation();

  const sortOptions: SortOption[] = [
    {
      field: 'dueDate',
      order: 'asc',
      label: t('tasks.sort.dueDateAsc', { defaultValue: 'Due Date (Earliest First)' }),
    },
    {
      field: 'dueDate',
      order: 'desc',
      label: t('tasks.sort.dueDateDesc', { defaultValue: 'Due Date (Latest First)' }),
    },
    {
      field: 'difficulty',
      order: 'asc',
      label: t('tasks.sort.difficultyAsc', { defaultValue: 'Difficulty (Easiest First)' }),
    },
    {
      field: 'difficulty',
      order: 'desc',
      label: t('tasks.sort.difficultyDesc', { defaultValue: 'Difficulty (Hardest First)' }),
    },
    {
      field: 'status',
      order: 'asc',
      label: t('tasks.sort.statusAsc', { defaultValue: 'Status (A-Z)' }),
    },
    {
      field: 'status',
      order: 'desc',
      label: t('tasks.sort.statusDesc', { defaultValue: 'Status (Z-A)' }),
    },
  ];

  const selectedOption =
    sortOptions.find((opt) => opt.field === sortBy && opt.order === sortOrder) || sortOptions[0];

  const handleChange = (option: SortOption) => {
    onSortChange(option.field, option.order);
  };

  return (
    <div className="w-full max-w-xs">
      <Listbox value={selectedOption} onChange={handleChange}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <span className="block truncate text-sm text-gray-900 dark:text-white">
              {selectedOption.label}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {sortOptions.map((option, optionIdx) => (
                <Listbox.Option
                  key={optionIdx}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active
                        ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                        : 'text-gray-900 dark:text-gray-100'
                    }`
                  }
                  value={option}
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {option.label}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
