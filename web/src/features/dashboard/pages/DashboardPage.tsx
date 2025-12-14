import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useLogoutMutation } from '@/features/auth/authApi';
import { logout } from '@/features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logoutMutation] = useLogoutMutation();

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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">NU</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {user?.firstName} {user?.lastName}
              </span>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome, {user?.firstName}!
            </h2>
            <p className="text-gray-600">
              This is your dashboard. More features coming soon.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
