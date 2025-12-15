import { useState, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Dialog, Transition, Menu } from '@headlessui/react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  XMarkIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import * as HeroIcons from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '../api/categoryApi';
import { CategoryIconPicker } from '../components/CategoryIconPicker';
import { CategoryColorPicker } from '../components/CategoryColorPicker';
import type { Category, HeroiconName, CategoryColor } from '@/types/category';

type FilterType = 'all' | 'system' | 'custom';

interface CategoryFormData {
  name: string;
  icon: HeroiconName;
  color: CategoryColor;
}

const DynamicIcon = ({ name, className }: { name: HeroiconName; className?: string }) => {
  const iconKey = name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Icon';
  
  const Icon = (HeroIcons as any)[iconKey];
  return Icon ? <Icon className={className} /> : <HeroIcons.EllipsisHorizontalIcon className={className} />;
};

export const CategoryManagementPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<FilterType>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    icon: 'tag',
    color: 'blue-500',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // API hooks
  const { data: categories = [], isLoading } = useGetCategoriesQuery(
    { groupId: groupId! },
    { skip: !groupId }
  );
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  // TODO: Check if current user is admin of the group
  // For now, assume all authenticated users can manage categories
  const isAdmin = true; // currentUser !== null;

  // Filter categories
  const filteredCategories = categories.filter((cat) => {
    if (filter === 'system') return cat.isSystemCategory;
    if (filter === 'custom') return !cat.isSystemCategory;
    return true;
  });

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Category name must be at least 2 characters';
    } else if (formData.name.length > 50) {
      errors.name = 'Category name must be less than 50 characters';
    }

    // Check for duplicate names (case-insensitive)
    const duplicateExists = categories.some(
      (cat) =>
        cat.name.toLowerCase() === formData.name.trim().toLowerCase() &&
        cat.id !== selectedCategory?.id
    );
    if (duplicateExists) {
      errors.name = 'A category with this name already exists';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handlers
  const handleCreate = async () => {
    if (!validateForm() || !groupId) return;

    try {
      await createCategory({
        groupId,
        name: formData.name.trim(),
        icon: formData.icon,
        color: formData.color,
      }).unwrap();

      toast.success('Category created successfully');
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create category');
    }
  };

  const handleEdit = async () => {
    if (!validateForm() || !selectedCategory) return;

    try {
      await updateCategory({
        id: selectedCategory.id,
        name: formData.name.trim(),
        icon: formData.icon,
        color: formData.color,
      }).unwrap();

      toast.success('Category updated successfully');
      setIsEditModalOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update category');
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      await deleteCategory(selectedCategory.id).unwrap();
      toast.success('Category deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
    } catch (error: any) {
      if (error?.status === 409) {
        toast.error('Cannot delete category with assigned tasks');
      } else {
        toast.error(error?.data?.message || 'Failed to delete category');
      }
    }
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      icon: 'tag',
      color: 'blue-500',
    });
    setFormErrors({});
    setSelectedCategory(null);
  };

  if (!groupId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-600">Group ID is required</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <svg
            className="h-5 w-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Category Management
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage custom categories for your group
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Category
            </button>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4 flex items-center gap-2">
        <FunnelIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterType)}
          className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          <option value="system">System Only</option>
          <option value="custom">Custom Only</option>
        </select>
      </div>

      {/* Categories Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading categories...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Icon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Color
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tasks
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No categories found
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <DynamicIcon name={category.icon} className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-6 w-6 rounded-full bg-${category.color}`}
                          style={{
                            backgroundColor: category.color.includes('-')
                              ? undefined
                              : category.color,
                          }}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                          {category.color}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.isSystemCategory ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          System
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          Custom
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {category.taskCount}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {category.isSystemCategory ? (
                          <span className="text-gray-400 dark:text-gray-600 text-xs">
                            Immutable
                          </span>
                        ) : (
                          <Menu as="div" className="relative inline-block text-left">
                            <Menu.Button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                              <EllipsisVerticalIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </Menu.Button>
                            <Transition
                              as={Fragment}
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95"
                            >
                              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="py-1">
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() => openEditModal(category)}
                                        className={`${
                                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                        } flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                                      >
                                        <PencilIcon className="mr-3 h-4 w-4" />
                                        Edit
                                      </button>
                                    )}
                                  </Menu.Item>
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() => openDeleteModal(category)}
                                        disabled={category.taskCount > 0}
                                        className={`${
                                          active && category.taskCount === 0
                                            ? 'bg-red-50 dark:bg-red-900/20'
                                            : ''
                                        } flex w-full items-center px-4 py-2 text-sm ${
                                          category.taskCount > 0
                                            ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                            : 'text-red-600 dark:text-red-400'
                                        }`}
                                        title={
                                          category.taskCount > 0
                                            ? `Cannot delete: ${category.taskCount} task(s) assigned`
                                            : 'Delete category'
                                        }
                                      >
                                        <TrashIcon className="mr-3 h-4 w-4" />
                                        Delete
                                        {category.taskCount > 0 && (
                                          <span className="ml-auto text-xs">({category.taskCount})</span>
                                        )}
                                      </button>
                                    )}
                                  </Menu.Item>
                                </div>
                              </Menu.Items>
                            </Transition>
                          </Menu>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Transition appear show={isCreateModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsCreateModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25 dark:bg-opacity-75" />
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
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center justify-between"
                  >
                    Create Custom Category
                    <button
                      onClick={() => setIsCreateModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </Dialog.Title>

                  <div className="mt-4 space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full rounded-md border ${
                          formErrors.name
                            ? 'border-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                        } bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="e.g., Gardening"
                      />
                      {formErrors.name && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    {/* Icon Picker */}
                    <CategoryIconPicker
                      value={formData.icon}
                      onChange={(icon) => setFormData({ ...formData, icon })}
                      label="Icon"
                    />

                    {/* Color Picker */}
                    <CategoryColorPicker
                      value={formData.color}
                      onChange={(color) => setFormData({ ...formData, color })}
                      label="Color"
                    />
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      disabled={isCreating}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreate}
                      disabled={isCreating}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating ? 'Creating...' : 'Create Category'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Edit Modal */}
      <Transition appear show={isEditModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsEditModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25 dark:bg-opacity-75" />
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
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center justify-between"
                  >
                    Edit Category
                    <button
                      onClick={() => setIsEditModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </Dialog.Title>

                  <div className="mt-4 space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full rounded-md border ${
                          formErrors.name
                            ? 'border-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                        } bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="e.g., Gardening"
                      />
                      {formErrors.name && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    {/* Icon Picker */}
                    <CategoryIconPicker
                      value={formData.icon}
                      onChange={(icon) => setFormData({ ...formData, icon })}
                      label="Icon"
                    />

                    {/* Color Picker */}
                    <CategoryColorPicker
                      value={formData.color}
                      onChange={(color) => setFormData({ ...formData, color })}
                      label="Color"
                    />
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      disabled={isUpdating}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleEdit}
                      disabled={isUpdating}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Confirmation Modal */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsDeleteModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25 dark:bg-opacity-75" />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    Delete Category
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Are you sure you want to delete the category "
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedCategory?.name}
                      </span>
                      "? This action cannot be undone.
                    </p>
                    {selectedCategory?.taskCount && selectedCategory.taskCount > 0 && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">
                        Warning: This category has {selectedCategory.taskCount} task(s) assigned.
                        You cannot delete it.
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting || (selectedCategory?.taskCount ?? 0) > 0}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};
