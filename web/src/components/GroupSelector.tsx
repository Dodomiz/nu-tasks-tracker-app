import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { selectGroups, selectCurrentGroupId, setCurrentGroup } from '@/features/groups/groupSlice';
import { useGetMyGroupsQuery } from '@/features/groups/groupApi';
import type { Group } from '@/types/group';

export default function GroupSelector() {
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectGroups);
  const currentGroupId = useAppSelector(selectCurrentGroupId);
  const { isLoading } = useGetMyGroupsQuery({});

  const currentGroup = groups.find((g: Group) => g.id === currentGroupId);

  const handleGroupChange = (groupId: string) => {
    dispatch(setCurrentGroup(groupId));
  };

  if (isLoading) {
    return (
      <div className="w-48 h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md" />
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-sm">
        <a
          href="/groups/create"
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Create your first group
        </a>
      </div>
    );
  }

  return (
    <Listbox value={currentGroupId || ''} onChange={handleGroupChange}>
      <div className="relative w-48">
        <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm border border-gray-300 dark:border-gray-600">
          <span className="block truncate">
            {currentGroup ? (
              <div className="flex items-center gap-2">
                {currentGroup.avatarUrl && (
                  <img
                    src={currentGroup.avatarUrl}
                    alt=""
                    className="w-5 h-5 rounded-full"
                  />
                )}
                <span>{currentGroup.name}</span>
              </div>
            ) : (
              <span className="text-gray-500">Select group</span>
            )}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
            {groups.map((group: Group) => (
              <Listbox.Option
                key={group.id}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                    active
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                      : 'text-gray-900 dark:text-gray-100'
                  }`
                }
                value={group.id}
              >
                {({ selected }) => (
                  <>
                    <div className="flex items-center gap-2">
                      {group.avatarUrl && (
                        <img
                          src={group.avatarUrl}
                          alt=""
                          className="w-5 h-5 rounded-full"
                        />
                      )}
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {group.name}
                      </span>
                    </div>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
