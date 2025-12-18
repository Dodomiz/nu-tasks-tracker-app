import CreateCodeInviteForm from './CreateCodeInviteForm';
import CodeInvitationsList from './CodeInvitationsList';
import { useGetGroupCodeInvitesQuery } from '@/features/groups/groupApi';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface CodeInvitationsTabProps {
  groupId: string;
  isAdmin: boolean;
}

export default function CodeInvitationsTab({
  groupId,
  isAdmin,
}: CodeInvitationsTabProps) {
  const { data: invitesData, isLoading, error } = useGetGroupCodeInvitesQuery(groupId);

  if (!isAdmin) {
    return (
      <div className="py-8 text-center text-gray-600 dark:text-gray-400">
        <InformationCircleIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium">Admin Access Required</p>
        <p className="text-sm mt-2">
          Only group admins can manage code-based invitations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="ml-3 text-sm text-blue-800 dark:text-blue-300">
            <p className="font-medium">Code-Based Invitations</p>
            <p className="mt-1">
              Generate a shareable 8-character code that anyone can use to join your group.
              Optionally restrict it to a specific email address.
            </p>
          </div>
        </div>
      </div>

      {/* Create Invitation Form */}
      <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Create New Invitation
        </h4>
        <CreateCodeInviteForm groupId={groupId} />
      </div>

      {/* Invitations List */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Active Invitations
        </h4>
        {isLoading ? (
          <div className="py-8 text-center text-gray-600 dark:text-gray-400">
            Loading invitations...
          </div>
        ) : error ? (
          <div className="py-8 text-center text-red-600 dark:text-red-400">
            Failed to load invitations.
          </div>
        ) : invitesData && invitesData.invites && invitesData.invites.length > 0 ? (
          <CodeInvitationsList invites={invitesData.invites} />
        ) : (
          <div className="py-8 text-center text-gray-600 dark:text-gray-400">
            <p className="text-sm">No invitations yet.</p>
            <p className="text-xs mt-2">Create your first code invitation above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
