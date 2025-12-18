import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useCreateCodeInviteMutation } from '@/features/groups/groupApi';
import { useTranslation } from 'react-i18next';

interface CreateCodeInviteFormData {
  inviteType: 'any' | 'email';
  email?: string;
}

interface CreateCodeInviteFormProps {
  groupId: string;
}

export default function CreateCodeInviteForm({ groupId }: CreateCodeInviteFormProps) {
  const { t } = useTranslation();
  const [inviteType, setInviteType] = useState<'any' | 'email'>('any');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCodeInviteFormData>({
    defaultValues: {
      inviteType: 'any',
      email: '',
    },
  });

  const [createInvite, { isLoading }] = useCreateCodeInviteMutation();

  const onSubmit = async (data: CreateCodeInviteFormData) => {
    try {
      const response = await createInvite({
        groupId,
        email: data.inviteType === 'email' ? data.email : undefined,
      }).unwrap();

      setGeneratedCode(response.code);
      setCopied(false);
      reset();
      setInviteType('any');
      toast.success('Invitation code generated successfully!');
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || 'Failed to create invitation';
      toast.error(errorMessage);
    }
  };

  const handleCopyCode = async () => {
    if (!generatedCode) return;

    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  const handleCopyLink = async () => {
    if (!generatedCode) return;

    const shareableLink = `${window.location.origin}/groups/join-with-code/${generatedCode}`;
    try {
      await navigator.clipboard.writeText(shareableLink);
      setCopiedLink(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleCloseCodeDisplay = () => {
    setGeneratedCode(null);
    setCopied(false);
    setCopiedLink(false);
  };

  return (
    <div className="space-y-4">
      {generatedCode ? (
        /* Code Display after generation */
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-700 rounded-lg p-6">
          <p className="text-sm text-green-800 dark:text-green-300 font-medium mb-3 text-center">
            {t('groups.yourInvitationCode')}
          </p>
          
          {/* Code with Copy Button */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <code className="text-3xl font-mono font-bold text-green-900 dark:text-green-200 tracking-wider bg-white dark:bg-gray-800 px-4 py-2 rounded border border-green-300 dark:border-green-700">
              {generatedCode}
            </code>
            <button
              onClick={handleCopyCode}
              className="p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50"
              title="Copy code"
            >
              {copied ? (
                <CheckIcon className="h-6 w-6" />
              ) : (
                <ClipboardDocumentIcon className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Shareable Link */}
          <div className="border-t border-green-300 dark:border-green-700 pt-4">
            <p className="text-xs text-green-800 dark:text-green-300 font-medium mb-2">
              {t('groups.orShareThisLink')}
            </p>
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-300 dark:border-green-700">
              <code className="flex-1 text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                {window.location.origin}/groups/join-with-code/{generatedCode}
              </code>
              <button
                onClick={handleCopyLink}
                className="flex-shrink-0 p-1.5 rounded bg-green-600 hover:bg-green-700 text-white transition-colors"
                title="Copy link"
              >
                {copiedLink ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <ClipboardDocumentIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <p className="text-xs text-green-700 dark:text-green-400 mt-3 text-center">
            {t('groups.shareCodeInstructions')}
          </p>
          <button
            onClick={handleCloseCodeDisplay}
            className="mt-4 w-full text-sm text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-200 underline"
          >
            {t('common.close')}
          </button>
        </div>
      ) : (
        /* Invitation Form */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Invite Type Radio Buttons */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('groups.whoCanUseCode')}
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="any"
                  checked={inviteType === 'any'}
                  onChange={() => setInviteType('any')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {t('groups.anyoneWithCode')}
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="email"
                  checked={inviteType === 'email'}
                  onChange={() => setInviteType('email')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {t('groups.specificEmailOnly')}
                </span>
              </label>
            </div>
          </div>

          {/* Conditional Email Input */}
          {inviteType === 'email' && (
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t('groups.emailAddress')} <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                {...register('email', {
                  required:
                    inviteType === 'email' ? t('groups.emailRequired') : false,
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: t('groups.invalidEmailFormat'),
                  },
                })}
                placeholder="user@example.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>
          )}

          {/* Generate Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t('groups.generating') : t('groups.generateCode')}
          </button>
        </form>
      )}
    </div>
  );
}
