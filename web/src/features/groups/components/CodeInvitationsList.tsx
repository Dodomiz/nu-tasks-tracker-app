import { ClipboardDocumentIcon, CheckIcon, LinkIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/utils/dateFormatter';
import { useTranslation } from 'react-i18next';
import type { Invite } from '@/types/invite';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface CodeInvitationsListProps {
  invites: Invite[];
}

export default function CodeInvitationsList({
  invites,
}: CodeInvitationsListProps) {
  const { i18n } = useTranslation();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success('Code copied!');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  const handleCopyLink = async (code: string) => {
    const shareableLink = `${window.location.origin}/groups/join-with-code/${code}`;
    try {
      await navigator.clipboard.writeText(shareableLink);
      setCopiedLink(code);
      toast.success('Link copied!');
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
            Used
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="overflow-x-auto -mx-4 sm:-mx-0">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Code
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Target
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Invited By
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Created
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {invites.map((invite) => (
            <tr key={invite.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {invite.code}
                  </code>
                  <button
                    onClick={() => handleCopyCode(invite.code)}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
                    title="Copy code"
                  >
                    {copiedCode === invite.code ? (
                      <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <ClipboardDocumentIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                {invite.email ? (
                  <span className="font-medium">{invite.email}</span>
                ) : (
                  <span className="italic text-gray-500 dark:text-gray-400">
                    Any user
                  </span>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                {invite.invitedByName || 'Unknown'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {getStatusBadge(invite.status)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {formatDate(new Date(invite.createdAt), i18n.language)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <button
                  onClick={() => handleCopyLink(invite.code)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                  title="Copy shareable link"
                >
                  {copiedLink === invite.code ? (
                    <>
                      <CheckIcon className="h-4 w-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-4 w-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
