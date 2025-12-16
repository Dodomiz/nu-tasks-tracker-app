import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetGroupQuery, usePromoteMemberMutation, useRemoveMemberMutation } from '@/features/groups/groupApi';
import { useAppSelector } from '@/hooks/useAppSelector';
import { selectIsAdmin } from '@/features/groups/groupSlice';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { formatDate } from '@/utils/dateFormatter';
import { useState } from 'react';
import InviteMembersModal from '../components/InviteMembersModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import { toast } from 'react-hot-toast';

interface ConfirmAction {
  type: 'promote' | 'remove';
  userId: string;
  memberName: string;
}

export default function GroupDashboardPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isAdmin = useAppSelector(selectIsAdmin);
  const currentUser = useAppSelector(selectCurrentUser);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const { data: group, isLoading, error } = useGetGroupQuery(groupId!, {
    skip: !groupId,
  });

  const [promoteMember, { isLoading: isPromoting }] = usePromoteMemberMutation();
  const [removeMember, { isLoading: isRemoving }] = useRemoveMemberMutation();

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

  const canRemoveMember = (member: any) => {
    if (!group) return false;
    
    // Cannot remove yourself if you're the last admin
    const isCurrentUser = member.userId === currentUser?.id;
    const adminCount = group.members?.filter(m => m.role === 'Admin').length || 0;
    
    if (isCurrentUser && adminCount === 1) {
      return false;
    }
    
    return true;
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
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>

          {/* Group Header */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
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
              {isAdmin && (
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                >
                  Invite Members
                </button>
              )}
            </div>
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
                  Timezone
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {group.timezone}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Language
                </dt>

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
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {group.language === 'en' ? '🇺🇸 English' : '🇮🇱 עברית'}
                </dd>
              </div>
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

      {/* Invite Modal */}
      {isInviteModalOpen && groupId && (
        <InviteMembersModal
          groupId={groupId}
          groupName={group.name}
          invitationCode={group.invitationCode || ''}
          onClose={() => setIsInviteModalOpen(false)}
        />
      )}
    </>
  );
}
