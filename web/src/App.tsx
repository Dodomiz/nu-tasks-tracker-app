import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './hooks/useAppSelector';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';

function App() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/register"
        element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" replace />}
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />}
      />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
