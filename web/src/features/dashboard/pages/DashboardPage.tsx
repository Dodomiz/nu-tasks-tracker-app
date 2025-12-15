import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useLogoutMutation } from '@/features/auth/authApi';
import { logout } from '@/features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from '@/components/LanguageSelector';
import { useRTL } from '@/hooks/useRTL';
import { formatDate, formatRelative } from '@/utils/dateFormatter';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { isRTL } = useRTL();
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logoutMutation] = useLogoutMutation();
  const currentLang = useAppSelector((state) => state.language.current);

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (err) {
      // Logout failed on server, but we'll clear local state anyway
      console.error('Logout error:', err);
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : ''}`}>
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">NU</h1>
            </div>
            <div className={isRTL ? 'flex items-center gap-4 flex-row-reverse' : 'flex items-center gap-4'}>
              <LanguageSelector />
              <span className="text-gray-700">
                {user?.firstName} {user?.lastName}
              </span>
              <button onClick={handleLogout} className="btn btn-secondary">
                {t('auth.logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 rtl:text-right">
              {t('dashboard.welcome', { name: user?.firstName })}
            </h2>
            <p className="text-gray-600 rtl:text-right">
              {t('dashboard.noTasks')}
            </p>
            
            {/* Quick Actions */}
            <div className="mt-6 flex gap-4 flex-wrap">
              <button
                onClick={() => navigate('/profile')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                {t('dashboard.viewProfile', { defaultValue: 'View Profile' })}
              </button>
              <button
                onClick={() => navigate('/groups/create')}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                {t('dashboard.createGroup', { defaultValue: 'Create Group' })}
              </button>
            </div>

            <div className="mt-6 text-sm text-gray-500 rtl:text-right">
              <p>
                {t('common.today')}: {formatDate(new Date(), currentLang)}
              </p>
              <p>
                {t('common.lastUpdated')}: {formatRelative(new Date(), new Date(), currentLang)}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
