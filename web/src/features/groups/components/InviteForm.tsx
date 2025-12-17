import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { CheckIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { useInviteMemberMutation } from '@/features/groups/groupApi';

interface InviteFormProps {
  groupId: string;
  invitationCode: string;
}

export default function InviteForm({ groupId, invitationCode }: InviteFormProps) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [inviteMember, { isLoading }] = useInviteMemberMutation();

  const invitationUrl = `${window.location.origin}/groups/join/${invitationCode}`;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setSuccessMessage('');

    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      const result = await inviteMember({ groupId, email }).unwrap();
      setSuccessMessage(result.message);
      setEmail('');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: any) {
      if (error?.data?.message) {
        setEmailError(error.data.message);
      } else if (error?.status === 400) {
        setEmailError('Failed to send invitation. The group may be full (20 members max).');
      } else {
        setEmailError('Failed to send invitation. Please try again.');
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Invite New Members
      </h4>
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-lg bg-blue-900/10 dark:bg-blue-900/30 p-1">
          <Tab
            className={({ selected }) =>
              `w-full rounded-md py-2 text-sm font-medium leading-5 transition-colors ${
                selected
                  ? 'bg-white dark:bg-gray-600 text-blue-700 dark:text-blue-300 shadow'
                  : 'text-blue-600 dark:text-blue-400 hover:bg-white/[0.12] hover:text-blue-800 dark:hover:text-blue-200'
              }`
            }
          >
            Email Invite
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-md py-2 text-sm font-medium leading-5 transition-colors ${
                selected
                  ? 'bg-white dark:bg-gray-600 text-blue-700 dark:text-blue-300 shadow'
                  : 'text-blue-600 dark:text-blue-400 hover:bg-white/[0.12] hover:text-blue-800 dark:hover:text-blue-200'
              }`
            }
          >
            Shareable Link
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-3">
          {/* Email Invite Tab */}
          <Tab.Panel>
            <form onSubmit={handleEmailInvite} className="space-y-3">
              <div>
                <label
                  htmlFor="invite-email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="invite-email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm ${
                    emailError
                      ? 'border-red-500 dark:border-red-400'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="friend@example.com"
                />
                {emailError && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {emailError}
                  </p>
                )}
                {successMessage && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                    <CheckIcon className="h-4 w-4" />
                    <span>{successMessage}</span>
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
              >
                {isLoading ? 'Sending...' : 'Send Invitation'}
              </button>
            </form>
          </Tab.Panel>

          {/* Shareable Link Tab */}
          <Tab.Panel>
            <div className="space-y-3">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Share this link with anyone you want to invite:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={invitationUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center gap-2 transition-colors text-xs"
                >
                  {copied ? (
                    <>
                      <CheckIcon className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> Anyone with this link can join the group (up to 20 members).
                </p>
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
