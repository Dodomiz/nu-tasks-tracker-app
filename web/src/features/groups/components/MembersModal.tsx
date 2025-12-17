import { Fragment, useState } from 'react';
import { Dialog, Transition, Tab } from '@headlessui/react';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import InviteForm from './InviteForm';
import InvitesTab from './InvitesTab';
import { useGetGroupMembersQuery, useRemoveMemberMutation } from '@/features/groups/groupApi';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/utils/dateFormatter';
import { toast } from 'react-hot-toast';
import type { Role, Member } from '@/types/group';
import ConfirmationModal from '@/components/ConfirmationModal';

// Helper functions
const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const getAvatarColor = (userId: string) => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// MemberRow component
interface MemberRowProps {
  member: Member;
  isAdmin: boolean;
  isRemoving: boolean;
  onRemoveClick: (userId: string, firstName: string, lastName: string, role: Role) => void;
  language: string;
}

function MemberRow({ member, isAdmin, isRemoving, onRemoveClick, language }: MemberRowProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white text-sm flex-shrink-0 ${!member.avatarUrl || imageError ? getAvatarColor(member.userId) : ''}`}
            aria-label={`${member.firstName} ${member.lastName} avatar`}
          >
            {member.avatarUrl && !imageError ? (
              <img
                src={member.avatarUrl}
                alt={`${member.firstName} ${member.lastName}`}
                className="w-full h-full rounded-full object-cover"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            ) : (
              <span>
                {getInitials(member.firstName, member.lastName)}
              </span>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {member.firstName} {member.lastName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{member.email}</div>
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
        {formatDate(new Date(member.joinedAt), language)}
      </td>
      {isAdmin && (
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button
            onClick={() => onRemoveClick(member.userId, member.firstName, member.lastName, member.role)}
            disabled={isRemoving}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Remove member"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </td>
      )}
    </tr>
  );
}

interface MembersModalProps {
  groupId: string;
  groupName: string;
  invitationCode?: string;
  myRole: Role;
  currentUserId: string;
  onClose: () => void;
}

export default function MembersModal({ groupId, groupName, invitationCode, myRole, currentUserId, onClose }: MembersModalProps) {
  const { i18n } = useTranslation();
  const { data: members, isLoading, error } = useGetGroupMembersQuery(groupId);
  const [removeMember, { isLoading: isRemoving }] = useRemoveMemberMutation();
  const [memberToRemove, setMemberToRemove] = useState<{ userId: string; name: string } | null>(null);

  const isAdmin = myRole === 'Admin';
  const adminCount = members?.filter(m => m.role === 'Admin').length || 0;

  const canRemoveMember = (userId: string, role: Role) => {
    // Cannot remove the last admin
    if (role === 'Admin' && adminCount === 1) {
      return false;
    }
    return true;
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      await removeMember({
        groupId,
        userId: memberToRemove.userId,
      }).unwrap();
      
      toast.success(`${memberToRemove.name} removed from group`);
      setMemberToRemove(null);
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to remove member';
      toast.error(errorMessage);
      setMemberToRemove(null);
    }
  };

  const handleRemoveClick = (userId: string, firstName: string, lastName: string, role: Role) => {
    if (!canRemoveMember(userId, role)) {
      toast.error('Cannot remove the last admin. Promote another member first.');
      return;
    }
    setMemberToRemove({ userId, name: `${firstName} ${lastName}` });
  };

  return (
    <Transition appear show={true} as={Fragment}>
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
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center justify-between"
                >
                  Manage Members — {groupName}
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                <Tab.Group>
                  <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 dark:bg-blue-900/40 p-1 mt-4">
                    <Tab
                      className={({ selected }) =>
                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors ${
                          selected
                            ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow'
                            : 'text-blue-600 dark:text-blue-400 hover:bg-white/[0.12] hover:text-blue-800 dark:hover:text-blue-200'
                        }`
                      }
                    >
                      Members
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors ${
                          selected
                            ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow'
                            : 'text-blue-600 dark:text-blue-400 hover:bg-white/[0.12] hover:text-blue-800 dark:hover:text-blue-200'
                        }`
                      }
                    >
                      Invites
                    </Tab>
                  </Tab.List>
                  <Tab.Panels className="mt-4 h-[500px]">
                    {/* Members Tab */}
                    <Tab.Panel className="h-full overflow-y-auto">
                      {isLoading ? (
                        <div className="py-8 text-center text-gray-600 dark:text-gray-300">Loading members…</div>
                      ) : error ? (
                        <div className="py-8 text-center text-red-600 dark:text-red-400">Failed to load members.</div>
                      ) : members && members.length > 0 ? (
                        <div className="-mx-4 sm:-mx-6">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Member</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Joined</th>
                                {isAdmin && (
                                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                )}
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {members.map((m) => (
                                <MemberRow
                                  key={m.userId}
                                  member={m}
                                  isAdmin={isAdmin}
                                  isRemoving={isRemoving}
                                  onRemoveClick={handleRemoveClick}
                                  language={i18n.language}
                                />
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="py-8 text-center text-gray-600 dark:text-gray-300">No members found.</div>
                      )}
                    </Tab.Panel>

                    {/* Invites Tab */}
                    <Tab.Panel className="h-full overflow-y-auto">
                      {isAdmin && invitationCode && (
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                          <InviteForm
                            groupId={groupId}
                            invitationCode={invitationCode}
                          />
                        </div>
                      )}
                      <InvitesTab
                        groupId={groupId}
                        groupName={groupName}
                        isAdmin={isAdmin}
                      />
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>

      {/* Remove Member Confirmation */}
      {memberToRemove && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setMemberToRemove(null)}
          onConfirm={handleRemoveMember}
          title="Remove Member"
          message={`Are you sure you want to remove ${memberToRemove.name} from ${groupName}? They will lose access to all group tasks.`}
          confirmText="Remove"
          confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          isLoading={isRemoving}
        />
      )}
    </Transition>
  );
}
