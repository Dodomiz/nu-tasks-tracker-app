import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from './hooks/useAppSelector';
import { useAppDispatch } from './hooks/useAppDispatch';
import { setLanguage } from './app/slices/languageSlice';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';
import ProfilePage from './features/auth/pages/ProfilePage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import { CategoryManagementPage } from './features/categories';
import { TemplateManagement } from './features/templates/pages/TemplateManagement';
import Toaster from '@/components/Toaster';
import DistributionWizardPage from './features/distribution/pages/DistributionWizardPage';
import DistributionPreviewPage from './features/distribution/pages/DistributionPreviewPage';
import CreateGroupPage from './features/groups/pages/CreateGroupPage';
import GroupDashboardPage from './features/groups/pages/GroupDashboardPage';
import JoinGroupPage from './features/groups/pages/JoinGroupPage';
import RedeemCodePage from './features/groups/pages/RedeemCodePage';
import JoinWithCodePage from './features/groups/pages/JoinWithCodePage';

function App() {
  const { i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const direction = useAppSelector((state) => state.language.direction);

  // Sync HTML direction attribute with language
  useEffect(() => {
    document.documentElement.dir = direction;
  }, [direction]);

  // Sync Redux language state with i18n
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      if (lng === 'en' || lng === 'he') {
        dispatch(setLanguage(lng));
      }
    };

    i18n.on('languageChanged', handleLanguageChange);
    
    // Initialize with current language
    if (i18n.language && (i18n.language === 'en' || i18n.language === 'he')) {
      dispatch(setLanguage(i18n.language));
    }

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [dispatch, i18n]);

  return (
    <>
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
      <Route
        path="/forgot-password"
        element={!isAuthenticated ? <ForgotPasswordPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/reset-password"
        element={!isAuthenticated ? <ResetPasswordPage /> : <Navigate to="/" replace />}
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/profile"
        element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" replace />}
      />
      
      {/* Group routes */}
      <Route
        path="/groups/create"
        element={isAuthenticated ? <CreateGroupPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/groups/:groupId/dashboard"
        element={isAuthenticated ? <GroupDashboardPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/groups/join/:invitationCode"
        element={isAuthenticated ? <JoinGroupPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/groups/join-with-code/:code"
        element={isAuthenticated ? <JoinWithCodePage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/groups/join"
        element={isAuthenticated ? <RedeemCodePage /> : <Navigate to="/login" replace />}
      />
      
      <Route
        path="/groups/:groupId/categories"
        element={isAuthenticated ? <CategoryManagementPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/groups/:groupId/templates"
        element={isAuthenticated ? <TemplateManagement /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/groups/:groupId/distribution"
        element={isAuthenticated ? <DistributionWizardPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/distribution/preview/:id"
        element={isAuthenticated ? <DistributionPreviewPage /> : <Navigate to="/login" replace />}
      />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
      <Toaster />
    </>
  );
}

export default App;
