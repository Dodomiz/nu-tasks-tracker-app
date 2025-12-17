import { Fragment, useState, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useGetTasksQuery, useAssignTaskMutation } from '@/features/tasks/api/tasksApi';
import { useGetGroupMembersQuery } from '@/features/groups/groupApi';
import { formatDate } from '@/utils/dateFormatter';
import { toast } from 'react-hot-toast';
import type { Role } from '@/types/group';
import type { TaskResponse } from '@/features/tasks/api/tasksApi';

interface GroupTasksPanelProps {
  groupId: string;
  groupName: string;
  myRole: Role;
  currentUserId: string;
  isOpen: boolean;
  onClose: () => void;
}

type TaskStatus = 'Pending' | 'InProgress' | 'Completed' | 'Overdue' | 'All';
type SortOption = 'CreatedAt' | 'UpdatedAt';
type SortOrder = 'asc' | 'desc';

export default function GroupTasksPanel({ groupId, groupName, myRole, isOpen, onClose }: GroupTasksPanelProps) {
  const { i18n } = useTranslation();
  const isAdmin = myRole === 'Admin';

  // Filters and sorting state
  const [statusFilter, setStatusFilter] = useState<TaskStatus>('All');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('CreatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data
  const { data: tasksData, isLoading: tasksLoading } = useGetTasksQuery({
    groupId,
    status: statusFilter === 'All' ? undefined : statusFilter,
    assignedTo: assigneeFilter === 'all' ? undefined : assigneeFilter,
    sortBy,
    order: sortOrder,
    pageSize: 50,
  });

  const { data: members } = useGetGroupMembersQuery(groupId);
  const [assignTask, { isLoading: isAssigning }] = useAssignTaskMutation();

  const tasks = tasksData?.items || [];

  // Create member map for quick lookup
  const memberMap = useMemo(() => {
    if (!members) return new Map();
    return new Map(members.map(m => [m.userId, m]));
  }, [members]);

  const handleAssign = async (taskId: string, assigneeUserId: string) => {
    try {
      await assignTask({ taskId, assigneeUserId }).unwrap();
      toast.success('Task assigned successfully');
    } catch (err: any) {
      const errorMessage = err?.data?.message || err?.data?.error || 'Failed to assign task';
      toast.error(errorMessage);
    }
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'InProgress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getAssigneeDisplay = (task: TaskResponse) => {
    const member = memberMap.get(task.assignedUserId);
    if (!member) return 'Unknown';
    return `${member.firstName} ${member.lastName}`;
  };

  const getAssigneeInitials = (task: TaskResponse) => {
    const member = memberMap.get(task.assignedUserId);
    if (!member) return '?';
    return `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium text-gray-900 dark:text-white">
                    Tasks — {groupName}
                  </Dialog.Title>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FunnelIcon className="h-5 w-5" />
                    </button>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Filters */}
                {showFilters && (
                  <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Status Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Status
                        </label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value as TaskStatus)}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="All">All Statuses</option>
                          <option value="Pending">Pending</option>
                          <option value="InProgress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </div>

                      {/* Assignee Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Assignee
                        </label>
                        <select
                          value={assigneeFilter}
                          onChange={(e) => setAssigneeFilter(e.target.value)}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="all">All Members</option>
                          {members?.map((member) => (
                            <option key={member.userId} value={member.userId}>
                              {member.firstName} {member.lastName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Sort */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Sort By
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          >
                            <option value="CreatedAt">Created</option>
                            <option value="UpdatedAt">Updated</option>
                          </select>
                          <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Task List */}
                <div className="max-h-96 overflow-y-auto">
                  {tasksLoading ? (
                    <div className="py-8 text-center text-gray-600 dark:text-gray-300">Loading tasks...</div>
                  ) : tasks.length === 0 ? (
                    <div className="py-8 text-center text-gray-600 dark:text-gray-300">
                      No tasks found.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          {/* Task Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {task.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                                {task.status}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Due: {formatDate(new Date(task.dueAt), i18n.language)}
                              </span>
                            </div>
                          </div>

                          {/* Assignee */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white text-xs font-medium">
                              {getAssigneeInitials(task)}
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
                              {getAssigneeDisplay(task)}
                            </span>
                          </div>

                          {/* Actions (Admin only) */}
                          {isAdmin && (
                            <div>
                              <select
                                value={task.assignedUserId}
                                onChange={(e) => handleAssign(task.id, e.target.value)}
                                disabled={isAssigning}
                                className="text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
                              >
                                {members?.map((member) => (
                                  <option key={member.userId} value={member.userId}>
                                    {member.firstName} {member.lastName}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {tasksData && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                    Showing {tasks.length} of {tasksData.total} tasks
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
