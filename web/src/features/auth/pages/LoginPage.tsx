import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLoginMutation } from '../authApi';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { setCredentials } from '../authSlice';
import { useRTL } from '@/hooks/useRTL';
import LanguageSelector from '@/components/LanguageSelector';

export default function LoginPage() {
  const { t } = useTranslation();
  const { isRTL } = useRTL();
  const location = useLocation();
  const successMessage = (location.state as any)?.message;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await login({ email, password }).unwrap();
      dispatch(
        setCredentials({
          user: result.data.user,
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
        })
      );
      navigate('/');
    } catch (err: any) {
      setError(err?.data?.message || t('auth.login.failed'));
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${isRTL ? 'rtl' : ''}`}>
      <div className="max-w-md w-full space-y-8">
        <div className={isRTL ? 'flex items-center justify-between flex-row-reverse' : 'flex items-center justify-between'}>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 rtl:text-right">
            {t('auth.login.title')}
          </h2>
          <LanguageSelector />
        </div>
        <p className="mt-2 text-sm text-gray-600 rtl:text-right text-center">
          {t('auth.login.noAccount')}{' '}
          <Link
            to="/register"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            {t('auth.login.createAccount')}
          </Link>
        </p>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {successMessage && (
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          )}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                {t('auth.login.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input rounded-b-none"
                placeholder={t('auth.login.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t('auth.login.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input rounded-t-none"
                placeholder={t('auth.login.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              {t('auth.login.forgotPassword')}
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? t('auth.login.submitting') : t('auth.login.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
