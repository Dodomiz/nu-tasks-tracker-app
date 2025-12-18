import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRedeemCodeInviteMutation } from '@/features/groups/groupApi';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

/**
 * Direct link redemption page (FR-026 enhancement)
 * Route: /groups/join/:code
 * Automatically redeems the code from URL parameter
 */
export default function JoinWithCodePage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [redeemInvite] = useRedeemCodeInviteMutation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [groupData, setGroupData] = useState<{ groupId: string; groupName: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!code) {
      setStatus('error');
      setErrorMessage('No invitation code provided');
      return;
    }

    const redeemCode = async () => {
      try {
        const response = await redeemInvite({ code: code.toUpperCase() }).unwrap();
        setStatus('success');
        setGroupData({
          groupId: response.groupId,
          groupName: response.groupName,
        });
        toast.success(response.message || 'Successfully joined group!');
      } catch (error: any) {
        setStatus('error');
        const message = error?.data?.message || 'Failed to redeem invitation code';
        setErrorMessage(message);
        toast.error(message);
      }
    };

    redeemCode();
  }, [code, redeemInvite]);

  const handleGoToGroup = () => {
    if (groupData) {
      navigate(`/groups/${groupData.groupId}`);
    }
  };

  const handleGoToDashboard = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Joining Group...
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Redeeming invitation code {code}
              </p>
            </div>
          )}

          {status === 'success' && groupData && (
            <div className="text-center">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to {groupData.groupName}!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You've successfully joined the group.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleGoToGroup}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Go to Group
                </button>
                <button
                  onClick={handleGoToDashboard}
                  className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Unable to Join Group
              </h2>
              <p className="text-red-600 dark:text-red-400 mb-6">
                {errorMessage}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleGoToDashboard}
                  className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
