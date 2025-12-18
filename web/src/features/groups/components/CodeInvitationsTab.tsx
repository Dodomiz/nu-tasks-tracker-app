import CreateCodeInviteForm from './CreateCodeInviteForm';
import CodeInvitationsList from './CodeInvitationsList';
import { useGetGroupCodeInvitesQuery } from '@/features/groups/groupApi';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

interface CodeInvitationsTabProps {
  groupId: string;
  isAdmin: boolean;
}

export default function CodeInvitationsTab({
  groupId,
  isAdmin,
}: CodeInvitationsTabProps) {
  const { t } = useTranslation();
  const { data: invitesData, isLoading, error } = useGetGroupCodeInvitesQuery(groupId);

  if (!isAdmin) {
    return (
      <div className="py-8 text-center text-gray-600 dark:text-gray-400">
        <InformationCircleIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium">{t('groups.adminAccessRequired')}</p>
        <p className="text-sm mt-2">
          {t('groups.adminAccessRequiredMessage')}
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
            <p className="font-medium">{t('groups.oneTimeCodeInvitations')}</p>
            <p className="mt-1">
              {t('groups.oneTimeCodeDescription')}
            </p>
          </div>
        </div>
      </div>

      {/* Create Invitation Form */}
      <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          {t('groups.createNewInvitation')}
        </h4>
        <CreateCodeInviteForm groupId={groupId} />
      </div>

      {/* Invitations List */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          {t('groups.activeInvitations')}
        </h4>
        {isLoading ? (
          <div className="py-8 text-center text-gray-600 dark:text-gray-400">
            {t('groups.loadingInvitations')}
          </div>
        ) : error ? (
          <div className="py-8 text-center text-red-600 dark:text-red-400">
            {t('groups.failedToLoadInvitations')}
          </div>
        ) : invitesData && invitesData.invites && invitesData.invites.length > 0 ? (
          <CodeInvitationsList invites={invitesData.invites} />
        ) : (
          <div className="py-8 text-center text-gray-600 dark:text-gray-400">
            <p className="text-sm">{t('groups.noInvitationsYet')}</p>
            <p className="text-xs mt-2">{t('groups.createFirstInvitation')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
