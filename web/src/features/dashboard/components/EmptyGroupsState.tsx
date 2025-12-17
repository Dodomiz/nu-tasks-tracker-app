import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function EmptyGroupsState() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-4"
      role="region"
      aria-label="No groups found"
    >
      {/* Icon with subtle animation */}
      <div className="mb-8 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-primary-100 rounded-full blur-2xl opacity-30 animate-pulse"></div>
          <svg
            className="w-32 h-32 text-gray-300 relative z-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
      </div>

      {/* Message */}
      <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        {t('dashboard.noGroups', { defaultValue: "You're not part of any groups yet" })}
      </h2>
      
      <p className="text-lg text-gray-600 text-center mb-10 max-w-lg leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {t('dashboard.noGroupsDescription', {
          defaultValue: 'Create your first group to start collaborating with others or join an existing group with an invitation code.',
        })}
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <button
          onClick={() => navigate('/groups/create')}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors inline-flex items-center justify-center"
          aria-label="Create your first group"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          {t('dashboard.createFirstGroup', { defaultValue: 'Create Your First Group' })}
        </button>

        <button
          onClick={() => navigate('/groups/join')}
          className="px-6 py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors inline-flex items-center justify-center"
          aria-label="Join group with code"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
          </svg>
          {t('dashboard.joinWithCode', { defaultValue: 'Join Group with Code' })}
        </button>
      </div>
    </div>
  );
}
