import { useGetGroupQuery } from '@/features/groups/groupApi';
import MembersModal from '@/features/groups/components/MembersModal';
import type { Role } from '@/types/group';

interface ManageMembersModalWrapperProps {
  groupId: string;
  currentUserId: string;
  onClose: () => void;
}

export default function ManageMembersModalWrapper({
  groupId,
  currentUserId,
  onClose,
}: ManageMembersModalWrapperProps) {
  const { data: group, isLoading, error } = useGetGroupQuery(groupId);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm">
          <p className="text-red-600 dark:text-red-400">Failed to load group details.</p>
          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <MembersModal
      groupId={group.id}
      groupName={group.name}
      invitationCode={group.invitationCode}
      myRole={group.myRole as Role}
      currentUserId={currentUserId}
      onClose={onClose}
    />
  );
}
