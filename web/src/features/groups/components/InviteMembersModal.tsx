import { Fragment, useState } from 'react';
import { Dialog, Transition, Tab } from '@headlessui/react';
import { XMarkIcon, CheckIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { useInviteMemberMutation } from '@/features/groups/groupApi';

interface InviteMembersModalProps {
  groupId: string;
  groupName: string;
  invitationCode: string;
  onClose: () => void;
}

export default function InviteMembersModal({
  groupId,
  groupName,
  invitationCode,
  onClose,
}: InviteMembersModalProps) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [inviteMember, { isLoading }] = useInviteMemberMutation();

  const invitationUrl = `${window.location.origin}/groups/join/${invitationCode}`;

  const validateEmail = (email: string): boolean => {
    // RFC 5322 simplified regex
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center justify-between"
                >
                  Invite Members to {groupName}
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
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
                      Email Invite
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
                      Shareable Link
                    </Tab>
                  </Tab.List>
                  <Tab.Panels className="mt-4">
                    {/* Email Invite Tab */}
                    <Tab.Panel>
                      <form onSubmit={handleEmailInvite} className="space-y-4">
                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                          >
                            Email Address
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setEmailError('');
                            }}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                              emailError
                                ? 'border-red-500 dark:border-red-400'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="friend@example.com"
                          />
                          {emailError && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                              {emailError}
                            </p>
                          )}
                          {successMessage && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                              <CheckIcon className="h-5 w-5" />
                              <span>{successMessage}</span>
                            </div>
                          )}
                        </div>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                          {isLoading ? 'Sending...' : 'Send Invitation'}
                        </button>
                      </form>
                    </Tab.Panel>

                    {/* Shareable Link Tab */}
                    <Tab.Panel>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Share this link with anyone you want to invite to the group:
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={invitationUrl}
                            readOnly
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          />
                          <button
                            onClick={handleCopyLink}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center gap-2 transition-colors"
                          >
                            {copied ? (
                              <>
                                <CheckIcon className="h-5 w-5" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <ClipboardDocumentIcon className="h-5 w-5" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            <strong>Note:</strong> Anyone with this link can join the group (up to 20 members total).
                          </p>
                        </div>
                      </div>
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
