import { Fragment, useState } from 'react';
import { Dialog, Transition, Tab } from '@headlessui/react';
import { XMarkIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import InviteForm from './InviteForm';
import CodeInvitationsTab from './CodeInvitationsTab';
import { useGetGroupMembersQuery, useRemoveMemberMutation, usePromoteMemberMutation, useDemoteMemberMutation } from '@/features/groups/groupApi';
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
  isChangingRole: boolean;
  adminCount: number;
  currentUserId: string;
  onRemoveClick: (userId: string, firstName: string, lastName: string, role: Role) => void;
  onPromoteClick: (userId: string, firstName: string, lastName: string) => void;
  onDemoteClick: (userId: string, firstName: string, lastName: string) => void;
  language: string;
}

function MemberRow({ member, isAdmin, isRemoving, isChangingRole, adminCount, currentUserId, onRemoveClick, onPromoteClick, onDemoteClick, language }: MemberRowProps) {
  const [imageError, setImageError] = useState(false);
  const isLastAdmin = member.role === 'Admin' && adminCount === 1;
  const isSelf = member.userId === currentUserId;

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
          <div className="flex items-center justify-end gap-2">
            {member.role === 'RegularUser' ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onPromoteClick(member.userId, member.firstName, member.lastName);
                }}
                disabled={isChangingRole || isSelf}
                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title={isSelf ? "Cannot change your own role" : "Promote to Admin"}
                type="button"
              >
                <ArrowUpIcon className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDemoteClick(member.userId, member.firstName, member.lastName);
                }}
                disabled={isChangingRole || isLastAdmin || isSelf}
                className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title={isSelf ? "Cannot change your own role" : isLastAdmin ? "Cannot demote the last admin" : "Demote to User"}
                type="button"
              >
                <ArrowDownIcon className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveClick(member.userId, member.firstName, member.lastName, member.role);
              }}
              disabled={isRemoving}
              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove member"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
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
  const [promoteMember, { isLoading: isPromoting }] = usePromoteMemberMutation();
  const [demoteMember, { isLoading: isDemoting }] = useDemoteMemberMutation();
  const [memberToRemove, setMemberToRemove] = useState<{ userId: string; name: string } | null>(null);
  const [memberToPromote, setMemberToPromote] = useState<{ userId: string; name: string } | null>(null);
  const [memberToDemote, setMemberToDemote] = useState<{ userId: string; name: string } | null>(null);

  const isAdmin = myRole === 'Admin';
  const adminCount = members?.filter(m => m.role === 'Admin').length || 0;

  const canRemoveMember = (_userId: string, role: Role) => {
    // Cannot remove the last admin
    return !(role === 'Admin' && adminCount === 1);

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

  const handlePromoteClick = (userId: string, firstName: string, lastName: string) => {
    setMemberToPromote({ userId, name: `${firstName} ${lastName}` });
  };

  const handleDemoteClick = (userId: string, firstName: string, lastName: string) => {
    setMemberToDemote({ userId, name: `${firstName} ${lastName}` });
  };

  const handlePromoteMember = async () => {
    if (!memberToPromote) return;

    try {
      await promoteMember({
        groupId,
        userId: memberToPromote.userId,
      }).unwrap();
      
      toast.success(`${memberToPromote.name} promoted to Admin`);
      setMemberToPromote(null);
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to promote member';
      toast.error(errorMessage);
      setMemberToPromote(null);
    }
  };

  const handleDemoteMember = async () => {
    if (!memberToDemote) return;

    try {
      await demoteMember({
        groupId,
        userId: memberToDemote.userId,
      }).unwrap();
      
      toast.success(`${memberToDemote.name} demoted to Regular User`);
      setMemberToDemote(null);
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to demote member';
      toast.error(errorMessage);
      setMemberToDemote(null);
    }
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
                      Public Link
                    </Tab>
                    {isAdmin && (
                      <Tab
                        className={({ selected }) =>
                          `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors ${
                            selected
                              ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow'
                              : 'text-blue-600 dark:text-blue-400 hover:bg-white/[0.12] hover:text-blue-800 dark:hover:text-blue-200'
                          }`
                        }
                      >
                        Code Invites
                      </Tab>
                    )}
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
                                  isChangingRole={isPromoting || isDemoting}
                                  adminCount={adminCount}
                                  currentUserId={currentUserId}
                                  onRemoveClick={handleRemoveClick}
                                  onPromoteClick={handlePromoteClick}
                                  onDemoteClick={handleDemoteClick}
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

                    {/* Public Link Tab */}
                    <Tab.Panel className="h-full overflow-y-auto">
                      {invitationCode ? (
                        <InviteForm
                          groupId={groupId}
                          invitationCode={invitationCode}
                        />
                      ) : (
                        <div className="py-8 text-center text-gray-600 dark:text-gray-400">
                          No invitation code available
                        </div>
                      )}
                    </Tab.Panel>

                    {/* Code Invites Tab (FR-026) */}
                    {isAdmin && (
                      <Tab.Panel className="h-full overflow-y-auto">
                        <CodeInvitationsTab
                          groupId={groupId}
                          isAdmin={isAdmin}
                        />
                      </Tab.Panel>
                    )}
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
          onCancel={() => setMemberToRemove(null)}
          onConfirm={handleRemoveMember}
          title="Remove Member"
          message={`Are you sure you want to remove ${memberToRemove.name} from ${groupName}? They will lose access to all group tasks.`}
          confirmText="Remove"
          confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          isLoading={isRemoving}
        />
      )}

      {/* Promote Member Confirmation */}
      {memberToPromote && (
        <ConfirmationModal
            isOpen={true}
            onCancel={() => setMemberToPromote(null)}
            onConfirm={handlePromoteMember}
            title="Promote to Admin"
            message={`Are you sure you want to promote ${memberToPromote.name} to Admin? They will be able to manage members, invitations, and group settings.`}
            confirmText="Promote"
            confirmButtonClass="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
            isLoading={isPromoting}
          />
      )}

      {/* Demote Member Confirmation */}
      {memberToDemote && (
        <ConfirmationModal
          isOpen={true}
          onCancel={() => setMemberToDemote(null)}
          onConfirm={handleDemoteMember}
            title="Demote to User"
            message={`Are you sure you want to demote ${memberToDemote.name} to Regular User? They will lose admin privileges.`}
            confirmText="Demote"
            confirmButtonClass="bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
            isLoading={isDemoting}
          />
      )}
    </Transition>
  );
}
