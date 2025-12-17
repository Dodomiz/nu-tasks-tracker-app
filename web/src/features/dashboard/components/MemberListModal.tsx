import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { enUS, he } from 'date-fns/locale';
import Modal from '@/components/Modal';
import type { MemberSummary, GroupCardDto } from '@/types/dashboard';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  group: GroupCardDto;
  currentUserRole: 'Admin' | 'Member';
}

export default function MemberListModal({ isOpen, onClose, group, currentUserRole }: Props) {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const isAdmin = currentUserRole === 'Admin';

  const locale = i18n.language === 'he' ? he : enUS;

  // Combine all members (admins + recent members)
  const allMembers: MemberSummary[] = useMemo(() => {
    return [...group.admins, ...group.recentMembers];
  }, [group.admins, group.recentMembers]);

  // Filter members based on search query (debounced client-side)
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return allMembers;

    const query = searchQuery.toLowerCase();
    return allMembers.filter(
      (member) =>
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query)
    );
  }, [allMembers, searchQuery]);

  const handlePromote = (userId: string, memberName: string) => {
    // TODO: Implement promote API call
    console.log('Promote user:', userId, memberName);
    // Will show confirmation dialog and call API
  };

  const handleRemove = (userId: string, memberName: string) => {
    // TODO: Implement remove API call with last-admin safeguard
    const adminCount = allMembers.filter((m) => m.role === 'Admin').length;
    if (allMembers.find((m) => m.userId === userId)?.role === 'Admin' && adminCount <= 1) {
      alert(t('memberList.cannotRemoveLastAdmin', { defaultValue: 'Cannot remove the last admin' }));
      return;
    }
    console.log('Remove user:', userId, memberName);
    // Will show confirmation dialog and call API
  };

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (userId: string): string => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t('memberList.title', {
        defaultValue: 'Members of {{groupName}}',
        groupName: group.name,
      })}
    >
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-100"
            placeholder={t('memberList.searchPlaceholder', { defaultValue: 'Search members by name or role...' })}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={t('memberList.searchLabel', { defaultValue: 'Search members' })}
          />
        </div>

        {/* Members List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredMembers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="mt-2 text-sm">
                {t('memberList.noResults', { defaultValue: 'No members found matching your search' })}
              </p>
            </div>
          )}

          {filteredMembers.map((member) => (
            <div
              key={member.userId}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {/* Member Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-gray-700"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`h-10 w-10 rounded-full ${getAvatarColor(member.userId)} text-white flex items-center justify-center text-sm font-semibold ring-2 ring-white dark:ring-gray-700 ${member.avatarUrl ? 'hidden' : 'flex'}`}
                    role="img"
                    aria-label={`${member.firstName} ${member.lastName}`}
                  >
                    {getInitials(member.firstName, member.lastName)}
                  </div>
                </div>

                {/* Name and Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {member.firstName} {member.lastName}
                    </p>
                    {member.role === 'Admin' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {t('memberList.admin', { defaultValue: 'Admin' })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('memberList.memberSince', {
                      defaultValue: 'Member since {{date}}',
                      date: formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true, locale }),
                    })}
                  </p>
                </div>
              </div>

              {/* Admin Actions */}
              {isAdmin && (
                <div className="flex items-center gap-2 ml-4">
                  {member.role !== 'Admin' && (
                    <button
                      onClick={() => handlePromote(member.userId, `${member.firstName} ${member.lastName}`)}
                      className="px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={t('memberList.promoteLabel', {
                        defaultValue: 'Promote {{name}} to admin',
                        name: `${member.firstName} ${member.lastName}`,
                      })}
                    >
                      {t('memberList.promote', { defaultValue: 'Promote' })}
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(member.userId, `${member.firstName} ${member.lastName}`)}
                    className="px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label={t('memberList.removeLabel', {
                      defaultValue: 'Remove {{name}} from group',
                      name: `${member.firstName} ${member.lastName}`,
                    })}
                  >
                    {t('memberList.remove', { defaultValue: 'Remove' })}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Stats */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('memberList.totalMembers', {
              defaultValue: 'Showing {{count}} of {{total}} members',
              count: filteredMembers.length,
              total: allMembers.length,
            })}
          </p>
        </div>
      </div>
    </Modal>
  );
}
