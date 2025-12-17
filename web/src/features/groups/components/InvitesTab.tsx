import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useGetGroupInvitesQuery, useResendInviteMutation, useCancelInviteMutation } from '@/features/groups/groupApi';
import { formatDate } from '@/utils/dateFormatter';
import StatusPill from '@/components/StatusPill';
import ConfirmationModal from '@/components/ConfirmationModal';
import { toast } from 'react-hot-toast';

interface InvitesTabProps {
  groupId: string;
  groupName: string;
  isAdmin: boolean;
}

export default function InvitesTab({ groupId, isAdmin }: InvitesTabProps) {
  const { i18n } = useTranslation();
  const { data: invites, isLoading, error } = useGetGroupInvitesQuery(groupId);
  const [resendInvite, { isLoading: isResending }] = useResendInviteMutation();
  const [cancelInvite, { isLoading: isCanceling }] = useCancelInviteMutation();
  const [inviteToCancel, setInviteToCancel] = useState<{ id: string; email: string } | null>(null);

  const handleResend = async (inviteId: string, email: string) => {
    try {
      await resendInvite({ groupId, inviteId }).unwrap();
      toast.success(`Invite resent to ${email}`);
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to resend invite';
      toast.error(errorMessage);
    }
  };

  const handleCancelConfirm = async () => {
    if (!inviteToCancel) return;

    try {
      await cancelInvite({ groupId, inviteId: inviteToCancel.id }).unwrap();
      toast.success(`Invite to ${inviteToCancel.email} canceled`);
      setInviteToCancel(null);
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to cancel invite';
      toast.error(errorMessage);
      setInviteToCancel(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="py-8 text-center text-gray-600 dark:text-gray-300">
        Access restricted to group administrators.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-red-600 dark:text-red-400">
        Failed to load invites.
      </div>
    );
  }

  if (!invites || invites.length === 0) {
    return (
      <div className="py-8 text-center text-gray-600 dark:text-gray-300">
        No invites yet. Use the Members tab to invite someone.
      </div>
    );
  }

  return (
    <>
      <div className="max-h-96 overflow-y-auto -mx-4 sm:-mx-6">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Invited By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Invited At
              </th>
              {isAdmin && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {invites.map((invite) => (
              <tr key={invite.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {invite.email}
                  </div>
                  {invite.sendCount > 1 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Sent {invite.sendCount} times
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusPill status={invite.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {invite.invitedByName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(new Date(invite.invitedAt), i18n.language)}
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {invite.status === 'Pending' && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleResend(invite.id, invite.email)}
                          disabled={isResending}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Resend invite"
                        >
                          <ArrowPathIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setInviteToCancel({ id: invite.id, email: invite.email })}
                          disabled={isCanceling}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Cancel invite"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cancel Invite Confirmation */}
      {inviteToCancel && (
        <ConfirmationModal
          isOpen={true}
          onConfirm={handleCancelConfirm}
          title="Cancel Invite"
          message={`Are you sure you want to cancel the invitation to ${inviteToCancel.email}?`}
          confirmText="Cancel Invite"
          confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          isLoading={isCanceling}
          onCancel={() => setInviteToCancel(null)}
        />
      )}
    </>
  );
}
