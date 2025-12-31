import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

interface ApprovalIndicatorProps {
  requiresApproval: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function ApprovalIndicator({ requiresApproval, size = 'md' }: ApprovalIndicatorProps) {
  const { t } = useTranslation();

  if (!requiresApproval) {
    return null;
  }

  return (
    <div className="group relative inline-flex">
      <ShieldCheckIcon
        className={`${sizeClasses[size]} text-amber-600`}
        aria-label={t('tasks.approval.requiresApproval')}
      />
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
        <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
          {t('tasks.approval.tooltip')}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
