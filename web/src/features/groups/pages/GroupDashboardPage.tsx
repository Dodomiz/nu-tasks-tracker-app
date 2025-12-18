import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetGroupQuery, usePromoteMemberMutation, useRemoveMemberMutation, useUpdateGroupMutation } from '@/features/groups/groupApi';
import { useAppSelector } from '@/hooks/useAppSelector';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { formatDate } from '@/utils/dateFormatter';
import { useState } from 'react';
import MembersModal from '../components/MembersModal';
import GroupTasksPanel from '../components/GroupTasksPanel';
import ConfirmationModal from '@/components/ConfirmationModal';
import { toast } from 'react-hot-toast';
import { UpdateGroupRequest } from '@/types/group';

interface ConfirmAction {
  type: 'promote' | 'remove';
  userId: string;
  memberName: string;
}

export default function GroupDashboardPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectCurrentUser);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isTasksPanelOpen, setIsTasksPanelOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UpdateGroupRequest>({
    name: '',
    description: '',
    avatarUrl: '',
    category: ''
  });

  const { data: group, isLoading, error } = useGetGroupQuery(groupId!, {
    skip: !groupId,
  });

  // Determine admin status from the fetched group data
  const isAdmin = group?.myRole === 'Admin';

  const [promoteMember, { isLoading: isPromoting }] = usePromoteMemberMutation();
  const [removeMember, { isLoading: isRemoving }] = useRemoveMemberMutation();
  const [updateGroup, { isLoading: isUpdating }] = useUpdateGroupMutation();

  const handlePromoteMember = async () => {
    if (!confirmAction || !groupId) return;

    try {
      await promoteMember({
        groupId,
        userId: confirmAction.userId,
      }).unwrap();
      
      toast.success(`${confirmAction.memberName} promoted to admin successfully`);
      setConfirmAction(null);
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to promote member';
      toast.error(errorMessage);
      setConfirmAction(null);
    }
  };

  const handleRemoveMember = async () => {
    if (!confirmAction || !groupId) return;

    try {
      await removeMember({
        groupId,
        userId: confirmAction.userId,
      }).unwrap();
      
      toast.success(`${confirmAction.memberName} removed from group`);
      setConfirmAction(null);
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to remove member';
      toast.error(errorMessage);
      setConfirmAction(null);
    }
  };

  const handleStartEdit = () => {
    if (!group) return;
    setEditForm({
      name: group.name,
      description: group.description || '',
      avatarUrl: group.avatarUrl || '',
      category: group.category
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      name: '',
      description: '',
      avatarUrl: '',
      category: ''
    });
  };

  const handleSaveEdit = async () => {
    if (!groupId) return;

    try {
      await updateGroup({
        id: groupId,
        body: editForm
      }).unwrap();
      
      toast.success('Group updated successfully');
      setIsEditing(false);
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to update group';
      toast.error(errorMessage);
    }
  };

  const canRemoveMember = (member: any) => {
    if (!group) return false;
    
    // Cannot remove yourself if you're the last admin
    const isCurrentUser = member.userId === currentUser?.id;
    const adminCount = group.members?.filter(m => m.role === 'Admin').length || 0;
    
    return !(isCurrentUser && adminCount === 1);
    

  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
              Error Loading Group
            </h2>
            <p className="text-red-600 dark:text-red-400">
              {(error as any)?.data?.message || 'Group not found or you do not have access.'}
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-4 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>

          {/* Group Header */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            {isEditing ? (
              <div className="space-y-4">
                {/* Edit Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter group name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter group description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Avatar URL
                  </label>
                  <input
                    type="text"
                    value={editForm.avatarUrl}
                    onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="home">🏠 Home</option>
                    <option value="work">💼 Work</option>
                    <option value="school">📚 School</option>
                    <option value="personal">👤 Personal</option>
                    <option value="hobbies">🎨 Hobbies</option>
                    <option value="fitness">💪 Fitness</option>
                    <option value="finance">💰 Finance</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSaveEdit}
                    disabled={isUpdating || !editForm.name.trim()}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md font-medium"
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {group.avatarUrl && (
                    <img
                      src={group.avatarUrl}
                      alt={group.name}
                      className="w-16 h-16 rounded-full"
                    />
                  )}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {group.name}
                    </h1>
                    {group.description && (
                      <p className="mt-2 text-gray-600 dark:text-gray-400">
                        {group.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
                      </span>
                      <span>•</span>
                      <span>Created {formatDate(new Date(group.createdAt), i18n.language)}</span>
                      <span>•</span>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                        {group.myRole}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsTasksPanelOpen(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium"
                  >
                    View Tasks
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={handleStartEdit}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium"
                      >
                        Edit Group
                      </button>
                      <button
                        onClick={() => setIsMembersModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                      >
                        Manage Members
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Members List */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Members
            </h2>

            {group.members && group.members.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Joined
                      </th>
                      {isAdmin && (
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {group.members.map((member) => (
                      <tr key={member.userId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {member.firstName} {member.lastName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            member.role === 'Admin'
                              ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                              : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          }`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(new Date(member.joinedAt), i18n.language)}
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              {member.role !== 'Admin' && (
                                <button
                                  onClick={() =>
                                    setConfirmAction({
                                      type: 'promote',
                                      userId: member.userId,
                                      memberName: `${member.firstName} ${member.lastName}`,
                                    })
                                  }
                                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                >
                                  Promote
                                </button>
                              )}
                              {canRemoveMember(member) ? (
                                <button
                                  onClick={() =>
                                    setConfirmAction({
                                      type: 'remove',
                                      userId: member.userId,
                                      memberName: `${member.firstName} ${member.lastName}`,
                                    })
                                  }
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium"
                                >
                                  Remove
                                </button>
                              ) : (
                                <button
                                  disabled
                                  title="Cannot remove yourself as the last admin"
                                  className="text-gray-400 dark:text-gray-600 cursor-not-allowed"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                {isAdmin
                  ? 'No members yet. Invite people to join your group!'
                  : 'Only admins can view the full member list.'}
              </p>
            )}
          </div>

          {/* Group Info */}
          <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Group Settings
            </h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Category
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                  {group.category}
                </dd>
              </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <ConfirmationModal
          isOpen={true}
          title={confirmAction.type === 'promote' ? 'Promote Member' : 'Remove Member'}
          message={
            confirmAction.type === 'promote'
              ? `Are you sure you want to promote ${confirmAction.memberName} to admin? They will be able to manage members and group settings.`
              : `Are you sure you want to remove ${confirmAction.memberName} from this group? They will lose access to all group data.`
          }
          confirmText={confirmAction.type === 'promote' ? 'Promote' : 'Remove'}
          confirmButtonClass={
            confirmAction.type === 'promote'
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-red-600 hover:bg-red-700'
          }
          onConfirm={confirmAction.type === 'promote' ? handlePromoteMember : handleRemoveMember}
          onCancel={() => setConfirmAction(null)}
          isLoading={isPromoting || isRemoving}
        />
      )}
              {isAdmin && group.invitationCode && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Invitation Code
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                    {group.invitationCode}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Members Modal */}
      {isMembersModalOpen && groupId && (
        <MembersModal
          groupId={groupId}
          groupName={group.name}
          invitationCode={group.invitationCode || ''}
          myRole={group.myRole}
          currentUserId={currentUser?.id || ''}
          onClose={() => setIsMembersModalOpen(false)}
        />
      )}

      {/* Group Tasks Panel */}
      {groupId && (
        <GroupTasksPanel
          groupId={groupId}
          groupName={group.name}
          myRole={group.myRole}
          currentUserId={currentUser?.id || ''}
          isOpen={isTasksPanelOpen}
          onClose={() => setIsTasksPanelOpen(false)}
        />
      )}
    </>
  );
}
