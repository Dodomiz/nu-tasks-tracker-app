import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCreateTaskMutation, type CreateTaskRequest } from '@/app/api/tasksApi';
import { useAppSelector } from '@/hooks/useAppSelector';
import { selectCurrentGroup } from '@/features/groups/groupSlice';
import { useTranslation } from 'react-i18next';

interface Props {
  defaultGroupId?: string;
  onSuccess?: () => void;
  onError?: (message?: string) => void;
}

export default function CreateTaskForm({ defaultGroupId, onSuccess, onError }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState(1);
  const [assignedUserId, setAssignedUserId] = useState('');
  const [dueAt, setDueAt] = useState<string>('');
  const [frequency, setFrequency] = useState<CreateTaskRequest['frequency']>('OneTime');
  const currentGroup = useAppSelector(selectCurrentGroup);
  const groupId = defaultGroupId || currentGroup?.id || null;

  const [createTask, { isLoading, isSuccess, isError, error }] = useCreateTaskMutation();
  const [shakeKey, setShakeKey] = useState(0);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId) {
      setShakeKey((k) => k + 1);
      onError?.('No group selected');
      return;
    }
    
    // Explicitly convert datetime-local to ISO 8601 format for API
    const dueAtISO = new Date(dueAt).toISOString();
    
    const payload: CreateTaskRequest = {
      groupId,
      assignedUserId,
      name,
      description,
      difficulty,
      dueAt: dueAtISO,
      frequency,
    };
    
    try {
      await createTask(payload).unwrap();
      // Clear form on success
      setName('');
      setDescription('');
      setDifficulty(1);
      setAssignedUserId('');
      setDueAt('');
      setFrequency('OneTime');
      onSuccess?.();
    } catch (err: any) {
      setShakeKey((k) => k + 1);
      onError?.(err?.data?.message || 'Failed to create task');
    }
  };

  return (
    <motion.div
      key={shakeKey}
      initial={{ x: 0 }}
      animate={{ x: [0, -8, 8, -6, 6, -4, 4, 0] }}
      transition={{ duration: 0.35 }}
      className="bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 dark:from-gray-900 dark:via-indigo-900/10 dark:to-purple-900/10 rounded-2xl shadow-2xl border border-indigo-100 dark:border-indigo-800/30 overflow-hidden backdrop-blur-sm"
    >
      {/* Header */}
      <div className="relative px-6 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-xl font-bold tracking-tight">{t('tasks.createAndAssignTask')}</h3>
          </div>
          <p className="text-indigo-100 text-sm font-medium">{t('tasks.createTaskDescription')}</p>
        </div>
      </div>

      {/* Form Body */}
      <form onSubmit={onSubmit} className="p-6 space-y-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur">
        {/* Primary Info Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {t('tasks.taskName')}
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('tasks.taskNamePlaceholder')}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {t('tasks.assignTo')}
            </label>
            <select
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all disabled:opacity-60"
              value={assignedUserId}
              onChange={(e) => setAssignedUserId(e.target.value)}
              required
              disabled={!currentGroup?.members || currentGroup.members.length === 0}
            >
              <option value="">{currentGroup?.members && currentGroup.members.length > 0 ? t('tasks.chooseTeamMember') : t('tasks.noMembersAvailable')}</option>
              {currentGroup?.members?.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.firstName} {m.lastName}
                </option>
              ))}
            </select>
            {(!currentGroup?.members || currentGroup.members.length === 0) && (
              <p className="text-xs text-gray-500 mt-1">{t('tasks.addMembersToAssign')}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
            <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
            {t('tasks.description')}
          </label>
          <textarea
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all resize-none"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('tasks.descriptionPlaceholder')}
          />
        </div>

        {/* Details Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {t('tasks.difficulty')}
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={10}
                className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all"
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">/10</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {t('tasks.dueDate')}
            </label>
            <input
              type="datetime-local"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('tasks.frequency')}
            </label>
            <select
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as any)}
            >
              <option value="OneTime">{t('tasks.oneTime')}</option>
              <option value="Daily">{t('tasks.daily')}</option>
              <option value="Weekly">{t('tasks.weekly')}</option>
              <option value="BiWeekly">{t('tasks.biWeekly')}</option>
              <option value="Monthly">{t('tasks.monthly')}</option>
              <option value="Quarterly">{t('tasks.quarterly')}</option>
              <option value="Yearly">{t('tasks.yearly')}</option>
            </select>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {isSuccess && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {t('tasks.taskCreated')}
              </span>
            )}
            {isError && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-red-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {(error as any)?.data?.message || t('tasks.errorCreatingTask')}
              </span>
            )}
          </div>
          
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={isLoading || !groupId || !currentGroup?.members || currentGroup.members.length === 0}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('tasks.creating')}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('tasks.createTask')}
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
