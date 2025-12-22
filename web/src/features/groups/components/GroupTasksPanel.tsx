import { Fragment, useState, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, FunnelIcon, ClockIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useGetTasksQuery, useAssignTaskMutation, useUpdateTaskStatusMutation, useGetTaskHistoryQuery, useUpdateTaskMutation } from '@/features/tasks/api/tasksApi';
import { useGetGroupMembersQuery } from '@/features/groups/groupApi';
import { formatDate } from '@/utils/dateFormatter';
import { toast } from 'react-hot-toast';
import type { Role } from '@/types/group';
import type { TaskResponse, UpdateTaskRequest } from '@/features/tasks/api/tasksApi';

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
  const { t, i18n } = useTranslation();
  const isAdmin = myRole === 'Admin';

  // Filters and sorting state
  const [statusFilter, setStatusFilter] = useState<TaskStatus>('All');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('CreatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [statusDropdownTaskId, setStatusDropdownTaskId] = useState<string | null>(null);
  const [historyTaskId, setHistoryTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<TaskResponse | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateTaskRequest>({});

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
  const [updateTaskStatus, { isLoading: isUpdatingStatus }] = useUpdateTaskStatusMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const { data: taskHistory, isLoading: historyLoading } = useGetTaskHistoryQuery(historyTaskId || '', {
    skip: !historyTaskId,
  });

  const tasks = tasksData?.items || [];
  const statuses: Array<'Pending' | 'InProgress' | 'Completed' | 'Overdue'> = [
    'Pending',
    'InProgress',
    'Completed',
    'Overdue',
  ];

  // Create member map for quick lookup
  const memberMap = useMemo(() => {
    if (!members) return new Map();
    return new Map(members.map(m => [m.userId, m]));
  }, [members]);

  const handleAssign = async (taskId: string, assigneeUserId: string) => {
    try {
      await assignTask({ taskId, assigneeUserId }).unwrap();
      toast.success(t('groupTasksPanel.toast.assignSuccess'));
    } catch (err: any) {
      const errorMessage = err?.data?.message || err?.data?.error || t('groupTasksPanel.toast.assignError');
      toast.error(errorMessage);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: typeof statuses[number]) => {
    try {
      await updateTaskStatus({ taskId, status: newStatus }).unwrap();
      setStatusDropdownTaskId(null);
      toast.success(t('groupTasksPanel.toast.statusUpdateSuccess'));
    } catch (err: any) {
      const errorMessage = err?.data?.message || err?.data?.error || t('groupTasksPanel.toast.statusUpdateError');
      toast.error(errorMessage);
    }
  };

  const handleOpenEdit = (task: TaskResponse) => {
    setEditingTask(task);
    setEditFormData({
      name: task.name,
      description: task.description,
      difficulty: task.difficulty,
      dueAt: new Date(task.dueAt).toISOString().slice(0, 16), // Format for datetime-local input
    });
  };

  const handleCloseEdit = () => {
    setEditingTask(null);
    setEditFormData({});
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    try {
      // Prepare update data (only send changed fields)
      const updateData: UpdateTaskRequest = {};
      if (editFormData.name && editFormData.name !== editingTask.name) {
        updateData.name = editFormData.name;
      }
      if (editFormData.description !== editingTask.description) {
        updateData.description = editFormData.description;
      }
      if (editFormData.difficulty && editFormData.difficulty !== editingTask.difficulty) {
        updateData.difficulty = editFormData.difficulty;
      }
      if (editFormData.dueAt) {
        const newDueAt = new Date(editFormData.dueAt).toISOString();
        if (newDueAt !== editingTask.dueAt) {
          updateData.dueAt = newDueAt;
        }
      }

      // Only send if there are changes
      if (Object.keys(updateData).length > 0) {
        await updateTask({ taskId: editingTask.id, data: updateData }).unwrap();
        toast.success(t('groupTasksPanel.toast.updateSuccess'));
        handleCloseEdit();
      } else {
        toast.success(t('groupTasksPanel.toast.noChanges'));
        handleCloseEdit();
      }
    } catch (err: any) {
      const errorMessage = err?.data?.message || err?.data?.error || t('groupTasksPanel.toast.updateError');
      toast.error(errorMessage);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'InProgress':
        return 'bg-blue-100 text-blue-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Pending':
        return t('tasks.status.pending');
      case 'InProgress':
        return t('tasks.status.inProgress');
      case 'Completed':
        return t('tasks.status.completed');
      case 'Overdue':
        return t('tasks.status.overdue');
      default:
        return status;
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
                    {t('groupTasksPanel.title', { groupName })}
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
                          {t('groupTasksPanel.filters.status')}
                        </label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value as TaskStatus)}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="All">{t('groupTasksPanel.filters.allStatuses')}</option>
                          <option value="Pending">{t('tasks.status.pending')}</option>
                          <option value="InProgress">{t('tasks.status.inProgress')}</option>
                          <option value="Completed">{t('tasks.status.completed')}</option>
                          <option value="Overdue">{t('tasks.status.overdue')}</option>
                        </select>
                      </div>

                      {/* Assignee Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('groupTasksPanel.filters.assignee')}
                        </label>
                        <select
                          value={assigneeFilter}
                          onChange={(e) => setAssigneeFilter(e.target.value)}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="all">{t('groupTasksPanel.filters.allMembers')}</option>
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
                          {t('groupTasksPanel.filters.sortBy')}
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          >
                            <option value="CreatedAt">{t('groupTasksPanel.filters.created')}</option>
                            <option value="UpdatedAt">{t('groupTasksPanel.filters.updated')}</option>
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
                    <div className="py-8 text-center text-gray-600 dark:text-gray-300">{t('groupTasksPanel.loading')}</div>
                  ) : tasks.length === 0 ? (
                    <div className="py-8 text-center text-gray-600 dark:text-gray-300">
                      {t('groupTasksPanel.noTasks')}
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
                              {/* Status Badge - Clickable for admins */}
                              {isAdmin ? (
                                <div className="relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setStatusDropdownTaskId(statusDropdownTaskId === task.id ? null : task.id);
                                    }}
                                    disabled={isUpdatingStatus}
                                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(task.status)} hover:bg-opacity-80 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                                  >
                                    {getStatusLabel(task.status)}
                                  </button>
                                  
                                  {/* Status Dropdown */}
                                  {statusDropdownTaskId === task.id && !isUpdatingStatus && (
                                    <>
                                      <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setStatusDropdownTaskId(null)}
                                      />
                                      <div className="absolute z-20 mt-1 left-0 w-32 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                                        {statuses.map((status) => (
                                          <button
                                            key={status}
                                            onClick={() => handleStatusChange(task.id, status)}
                                            className={`w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-100 transition-colors ${
                                              status === task.status ? 'bg-blue-50 font-medium' : ''
                                            }`}
                                          >
                                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${getStatusColor(status).split(' ')[0]}`}></span>
                                            {getStatusLabel(status)}
                                          </button>
                                        ))}
                                      </div>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                                  {getStatusLabel(task.status)}
                                </span>
                              )}
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {t('groupTasksPanel.due', { date: formatDate(new Date(task.dueAt), i18n.language) })}
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
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenEdit(task)}
                                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                title={t('groupTasksPanel.editTask')}
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => setHistoryTaskId(task.id)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                title={t('groupTasksPanel.viewHistory')}
                              >
                                <ClockIcon className="h-5 w-5" />
                              </button>
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
                    {t('groupTasksPanel.showingCount', { count: tasks.length, total: tasksData.total })}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>

        {/* History Modal */}
        <Transition appear show={!!historyTaskId} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setHistoryTaskId(null)}>
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
                  <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <Dialog.Title as="h3" className="text-lg font-medium text-gray-900 dark:text-white">
                        {t('groupTasksPanel.history.title')}
                      </Dialog.Title>
                      <button onClick={() => setHistoryTaskId(null)} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {historyLoading ? (
                        <div className="py-8 text-center text-gray-600 dark:text-gray-300">
                          {t('groupTasksPanel.history.loading')}
                        </div>
                      ) : !taskHistory || taskHistory.length === 0 ? (
                        <div className="py-8 text-center text-gray-600 dark:text-gray-300">
                          {t('groupTasksPanel.history.noHistory')}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {taskHistory.map((entry) => (
                            <div key={entry.id} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div className="flex-shrink-0">
                                <ClockIcon className="h-5 w-5 text-gray-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {t(`groupTasksPanel.history.actions.${entry.action}`)}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDate(new Date(entry.changedAt), i18n.language)}
                                  </p>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                  {t('groupTasksPanel.history.by', { name: entry.changedByUserName })}
                                </p>
                                {Object.keys(entry.changes).length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {Object.entries(entry.changes).map(([key, value]) => (
                                      <div key={key} className="text-xs text-gray-500 dark:text-gray-400">
                                        <span className="font-medium">{t(`groupTasksPanel.history.fields.${key}`, key)}:</span> {value}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {entry.notes && (
                                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
                                    {entry.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* Edit Task Modal */}
        <Transition appear show={!!editingTask} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={handleCloseEdit}>
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
                  <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <Dialog.Title as="h3" className="text-lg font-medium text-gray-900 dark:text-white">
                        {t('groupTasksPanel.edit.title')}
                      </Dialog.Title>
                      <button onClick={handleCloseEdit} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>

                    <form onSubmit={handleEditSubmit} className="space-y-4">
                      {/* Task Name */}
                      <div>
                        <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('groupTasksPanel.edit.name')}
                        </label>
                        <input
                          id="edit-name"
                          type="text"
                          value={editFormData.name || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                          maxLength={200}
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('groupTasksPanel.edit.description')}
                        </label>
                        <textarea
                          id="edit-description"
                          value={editFormData.description || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                          rows={3}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      {/* Difficulty */}
                      <div>
                        <label htmlFor="edit-difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('groupTasksPanel.edit.difficulty')}
                        </label>
                        <input
                          id="edit-difficulty"
                          type="number"
                          min="1"
                          max="10"
                          value={editFormData.difficulty || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, difficulty: parseInt(e.target.value) })}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </div>

                      {/* Due Date */}
                      <div>
                        <label htmlFor="edit-dueAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('groupTasksPanel.edit.dueDate')}
                        </label>
                        <input
                          id="edit-dueAt"
                          type="datetime-local"
                          value={editFormData.dueAt || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, dueAt: e.target.value })}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-3 mt-6">
                        <button
                          type="button"
                          onClick={handleCloseEdit}
                          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                          {t('groupTasksPanel.edit.cancel')}
                        </button>
                        <button
                          type="submit"
                          disabled={isUpdating}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isUpdating ? t('groupTasksPanel.edit.saving') : t('groupTasksPanel.edit.save')}
                        </button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </Dialog>
    </Transition>
  );
}
