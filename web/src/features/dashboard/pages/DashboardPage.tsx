import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useLogoutMutation } from '@/features/auth/authApi';
import { logout } from '@/features/auth/authSlice';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import LanguageSelector from '@/components/LanguageSelector';
import { useRTL } from '@/hooks/useRTL';
import DashboardNavigation from '../components/DashboardNavigation';
import MyGroupsTab from '../components/MyGroupsTab';
import MyTasksTab from '../components/MyTasksTab';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { isRTL } = useRTL();
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : ''}`}>
      {/* Navigation Header - Preserved from original */}
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

      {/* Main Content - Dashboard with Tabs */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Tab Navigation */}
          <DashboardNavigation />

          {/* Tab Content */}
          <Routes>
            <Route path="groups" element={<MyGroupsTab />} />
            <Route path="tasks" element={<MyTasksTab />} />
            <Route index element={<Navigate to="groups" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
