import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { UpdateGroupRequest } from '@/types/group';

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  editForm: UpdateGroupRequest;
  onFormChange: (form: UpdateGroupRequest) => void;
  onSave: () => void;
  isSaving: boolean;
}

export default function EditGroupModal({
  isOpen,
  onClose,
  editForm,
  onFormChange,
  onSave,
  isSaving
}: EditGroupModalProps) {
  const { t } = useTranslation();

  const handleSave = () => {
    onSave();
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
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
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-semibold text-gray-900 dark:text-white"
                  >
                    {t('groups.editGroup', { defaultValue: 'Edit Group' })}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                    aria-label="Close"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('groups.groupName', { defaultValue: 'Group Name' })}
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => onFormChange({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder={t('groups.enterGroupName', { defaultValue: 'Enter group name' })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('groups.description', { defaultValue: 'Description' })}
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => onFormChange({ ...editForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder={t('groups.enterDescription', { defaultValue: 'Enter group description' })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('groups.avatarUrl', { defaultValue: 'Avatar URL' })}
                    </label>
                    <input
                      type="text"
                      value={editForm.avatarUrl}
                      onChange={(e) => onFormChange({ ...editForm, avatarUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('groups.category', { defaultValue: 'Category' })}
                    </label>
                    <select
                      value={editForm.category}
                      onChange={(e) => onFormChange({ ...editForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="home">🏠 {t('categories.home', { defaultValue: 'Home' })}</option>
                      <option value="work">💼 {t('categories.work', { defaultValue: 'Work' })}</option>
                      <option value="school">📚 {t('categories.school', { defaultValue: 'School' })}</option>
                      <option value="personal">👤 {t('categories.personal', { defaultValue: 'Personal' })}</option>
                      <option value="hobbies">🎨 {t('categories.hobbies', { defaultValue: 'Hobbies' })}</option>
                      <option value="fitness">💪 {t('categories.fitness', { defaultValue: 'Fitness' })}</option>
                      <option value="finance">💰 {t('categories.finance', { defaultValue: 'Finance' })}</option>
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    onClick={onClose}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('common.cancel', { defaultValue: 'Cancel' })}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !editForm.name.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? t('common.saving', { defaultValue: 'Saving...' }) : t('common.save', { defaultValue: 'Save Changes' })}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
