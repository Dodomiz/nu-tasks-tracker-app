import { useState } from 'react';
import { CheckIcon, ClipboardDocumentIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface InviteFormProps {
  groupId: string;
  invitationCode: string;
}

/**
 * Simplified InviteForm - Shows only public shareable link
 * For one-time codes (email-specific or any-user), use Code Invites tab
 */
export default function InviteForm({ invitationCode }: InviteFormProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const invitationUrl = `${window.location.origin}/groups/join/${invitationCode}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-medium">{t('groups.publicShareableLink')}</p>
            <p className="mt-1">
              {t('groups.publicLinkDescription')}
            </p>
          </div>
        </div>
      </div>

      {/* Shareable Link Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          {t('groups.shareThisLink')}
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={invitationUrl}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono"
          />
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center gap-2 transition-colors text-sm"
          >
            {copied ? (
              <>
                <CheckIcon className="h-5 w-5" />
                {t('groups.copied')}
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="h-5 w-5" />
                {t('groups.copy')}
              </>
            )}
          </button>
        </div>
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>{t('groups.note')}:</strong> {t('groups.publicLinkNote')}
          </p>
        </div>
      </div>
    </div>
  );
}
