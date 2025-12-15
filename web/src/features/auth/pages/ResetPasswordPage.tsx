import { useState, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRTL } from '@/hooks/useRTL';
import { useResetPasswordMutation } from '../authApi';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const { isRTL } = useRTL();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError(t('auth.resetPassword.invalidToken'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('auth.resetPassword.passwordMismatch'));
      return;
    }

    if (newPassword.length < 8) {
      setError(t('auth.register.passwordTooShort'));
      return;
    }

    try {
      await resetPassword({ token, newPassword }).unwrap();
      // Show success and redirect to login
      navigate('/login', {
        state: { message: t('auth.resetPassword.success') },
      });
    } catch (err: any) {
      setError(err?.data?.message || t('auth.resetPassword.failed'));
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 rtl:text-right">
              {t('auth.resetPassword.invalidToken')}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 rtl:text-right">
              {t('auth.forgotPassword.description')}
            </p>
          </div>
          <div className="text-center">
            <Link
              to="/forgot-password"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              {t('auth.forgotPassword.submit')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${isRTL ? 'rtl' : ''}`}>
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 rtl:text-right">
            {t('auth.resetPassword.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 rtl:text-right">
            {t('auth.forgotPassword.description')}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="sr-only">
                {t('auth.resetPassword.password')}
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                className="input"
                placeholder={t('auth.resetPassword.password')}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                {t('auth.resetPassword.confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="input"
                placeholder={t('auth.resetPassword.confirmPassword')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? t('auth.resetPassword.submitting') : t('auth.resetPassword.submit')}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              {t('auth.forgotPassword.backToLogin')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
