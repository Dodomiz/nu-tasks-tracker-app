import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, TicketIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useRedeemCodeInviteMutation } from '@/features/groups/groupApi';
import { useNavigate } from 'react-router-dom';

interface RedeemCodeInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RedeemCodeFormData {
  code: string;
}

export default function RedeemCodeInviteModal({
  isOpen,
  onClose,
}: RedeemCodeInviteModalProps) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<RedeemCodeFormData>({
    defaultValues: {
      code: '',
    },
  });

  const [redeemInvite, { isLoading }] = useRedeemCodeInviteMutation();
  const [successData, setSuccessData] = useState<{
    groupId: string;
    groupName: string;
  } | null>(null);

  const codeValue = watch('code');

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to uppercase and remove spaces
    const cleaned = e.target.value.toUpperCase().replace(/\s/g, '');
    setValue('code', cleaned);
  };

  const onSubmit = async (data: RedeemCodeFormData) => {
    try {
      const response = await redeemInvite({ code: data.code }).unwrap();

      setSuccessData({
        groupId: response.groupId,
        groupName: response.groupName,
      });

      toast.success(response.message || 'Successfully joined group!');
      reset();
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Failed to redeem invitation';
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    reset();
    setSuccessData(null);
    onClose();
  };

  const handleGoToGroup = () => {
    if (successData) {
      navigate(`/groups/${successData.groupId}`);
      handleClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
                {successData ? (
                  /* Success State */
                  <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                      <TicketIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <Dialog.Title
                      as="h3"
                      className="mt-4 text-lg font-medium leading-6 text-gray-900 dark:text-white"
                    >
                      Successfully Joined!
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        You're now a member of{' '}
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {successData.groupName}
                        </span>
                        .
                      </p>
                    </div>
                    <div className="mt-6 flex gap-3">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={handleGoToGroup}
                        className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Go to Group
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Redeem Form */
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                      >
                        Join Group with Code
                      </Dialog.Title>
                      <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Enter the 8-character invitation code you received to join a
                        group.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div>
                        <label
                          htmlFor="code"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Invitation Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="code"
                          type="text"
                          {...register('code', {
                            required: 'Code is required',
                            minLength: {
                              value: 8,
                              message: 'Code must be 8 characters',
                            },
                            maxLength: {
                              value: 8,
                              message: 'Code must be 8 characters',
                            },
                            pattern: {
                              value: /^[A-Z0-9]{8}$/,
                              message: 'Code must contain only letters and numbers',
                            },
                          })}
                          onChange={handleCodeChange}
                          value={codeValue}
                          placeholder="ABC123XY"
                          maxLength={8}
                          className="w-full px-4 py-3 text-center text-2xl font-mono font-bold tracking-widest uppercase border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                        />
                        {errors.code && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.code.message}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleClose}
                          className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? 'Redeeming...' : 'Join Group'}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
