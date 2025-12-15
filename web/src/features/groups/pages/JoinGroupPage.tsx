import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useJoinGroupMutation } from '@/features/groups/groupApi';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { addGroup, setCurrentGroup } from '@/features/groups/groupSlice';
import { selectIsAuthenticated } from '@/features/auth/authSlice';

export default function JoinGroupPage() {
  const { invitationCode } = useParams<{ invitationCode: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [joinGroup, { isLoading: isJoining }] = useJoinGroupMutation();
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(`/groups/join/${invitationCode}`);
      navigate(`/login?returnUrl=${returnUrl}`);
    }
  }, [isAuthenticated, invitationCode, navigate]);

  const handleJoinGroup = async () => {
    if (!invitationCode) {
      setError('Invalid invitation code');
      return;
    }

    setError('');
    try {
      const result = await joinGroup(invitationCode).unwrap();
      dispatch(addGroup(result));
      dispatch(setCurrentGroup(result.id));
      navigate(`/groups/${result.id}/dashboard`);
    } catch (err: any) {
      if (err?.status === 400) {
        const message = err?.data?.message || err?.data?.error || 'Failed to join group';
        if (message.includes('Invalid invitation code')) {
          setError('This invitation link is invalid or has expired.');
        } else if (message.includes('already a member')) {
          setError("You're already a member of this group!");
          // Optionally navigate to the group if we have the ID
          setTimeout(() => navigate('/dashboard'), 2000);
        } else if (message.includes('full') || message.includes('20')) {
          setError('This group is full (20/20 members). Please contact the admin.');
        } else {
          setError(message);
        }
      } else if (err?.status === 404) {
        setError('Group not found. The invitation link may be invalid.');
      } else {
        setError('Failed to join group. Please try again later.');
      }
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Join Group
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You've been invited to join a group!
            </p>
          </div>

          <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click "Join Group" below to accept the invitation.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleJoinGroup}
              disabled={isJoining}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              {isJoining ? 'Joining...' : 'Join Group'}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> By joining, you'll be able to see and participate in all group activities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
