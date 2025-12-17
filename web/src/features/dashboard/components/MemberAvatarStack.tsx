import { useState } from 'react';
import type { MemberSummary } from '@/types/dashboard';

interface MemberAvatarStackProps {
  admins: MemberSummary[];
  members: MemberSummary[];
  maxVisible?: number;
  onViewAll?: () => void;
}

// Generate consistent color from userId
const getAvatarColor = (userId: string): string => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-teal-500',
  ];
  
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Get initials from name
const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

interface AvatarProps {
  member: MemberSummary;
  showCrown?: boolean;
  size?: 'sm' | 'md';
}

function Avatar({ member, showCrown = false, size = 'md' }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const sizeClasses = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  
  return (
    <div
      className={`relative ${sizeClasses} rounded-full flex items-center justify-center font-semibold text-white border-2 border-white shadow-sm hover:scale-110 transition-transform cursor-pointer`}
      title={`${member.firstName} ${member.lastName} (${member.role})`}
      aria-label={`${member.firstName} ${member.lastName}, ${member.role}`}
      role="img"
    >
      {member.avatarUrl && !imageError ? (
        <img
          src={member.avatarUrl}
          alt={`${member.firstName} ${member.lastName}`}
          className="w-full h-full rounded-full object-cover"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      ) : (
        <span className={`${getAvatarColor(member.userId)}`}>
          {getInitials(member.firstName, member.lastName)}
        </span>
      )}
      
      {showCrown && (
        <div
          className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm"
          title="Admin"
          aria-label="Admin badge"
        >
          <svg
            className="w-3 h-3 text-yellow-900"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

export default function MemberAvatarStack({
  admins,
  members,
  maxVisible = 8,
  onViewAll,
}: MemberAvatarStackProps) {
  const allMembers = [...admins, ...members];
  const visibleMembers = allMembers.slice(0, maxVisible);
  const remainingCount = Math.max(0, allMembers.length - maxVisible);
  
  return (
    <div className="flex items-center">
      {/* Avatar Stack */}
      <div className="flex -space-x-2">
        {visibleMembers.map((member, index) => (
          <div key={member.userId} style={{ zIndex: visibleMembers.length - index }}>
            <Avatar
              member={member}
              showCrown={member.role === 'Admin'}
              size="md"
            />
          </div>
        ))}
      </div>
      
      {/* +N More Button */}
      {remainingCount > 0 && onViewAll && (
        <button
          onClick={onViewAll}
          className="ml-2 px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          aria-label={`View ${remainingCount} more members`}
        >
          +{remainingCount} more
        </button>
      )}
    </div>
  );
}
