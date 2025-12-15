import { useState, FormEvent, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { updateUser } from '../authSlice';

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState(user?.profileImageUrl || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError(t('errors.validation'));
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError(t('errors.validation'));
      return;
    }

    setProfileImage(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      // TODO: Replace with actual API call when backend is ready
      // For now, just update Redux state
      dispatch(updateUser({ firstName, lastName }));
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setSuccess(t('auth.profile.success'));
      setIsEditing(false);
    } catch (err: any) {
      setError(err?.message || t('auth.profile.failed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setProfileImage(null);
    setProfileImagePreview(user?.profileImageUrl || '');
    setError('');
    setSuccess('');
    setIsEditing(false);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">{t('auth.profile.title')}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('settings.profile')}
            </p>
          </div>

          {/* Content */}
          <div className="px-4 py-5 sm:p-6">
            {success && (
              <div className="mb-4 rounded-md bg-green-50 p-4">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image */}
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0">
                  {profileImagePreview ? (
                    <img
                      src={profileImagePreview}
                      alt="Profile"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-3xl text-gray-500">
                        {firstName.charAt(0)}{lastName.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                {isEditing && (
                  <div>
                    <label className="btn btn-secondary cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png"
                        onChange={handleImageChange}
                      />
                      {t('common.edit')}
                    </label>
                    <p className="mt-2 text-xs text-gray-500">
                      JPG or PNG, max 5MB
                    </p>
                  </div>
                )}
              </div>

              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  {t('auth.profile.firstName')}
                </label>
                <input
                  type="text"
                  id="firstName"
                  className="mt-1 input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={!isEditing}
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  {t('auth.profile.lastName')}
                </label>
                <input
                  type="text"
                  id="lastName"
                  className="mt-1 input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={!isEditing}
                  required
                />
              </div>

              {/* Email (disabled) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('auth.profile.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 input bg-gray-100"
                  value={user.email}
                  disabled
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t('auth.profile.email')}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setShowChangePassword(true)}
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  {t('auth.profile.changePassword')}
                </button>

                <div className="flex space-x-3">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="btn btn-secondary"
                        disabled={isSaving}
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSaving}
                      >
                        {isSaving ? t('auth.profile.saving') : t('auth.profile.save')}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="btn btn-primary"
                    >
                      {t('common.edit')}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Change Password Modal */}
        {showChangePassword && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('auth.profile.changePassword')}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                This feature will be available once the backend is implemented.
              </p>
              <button
                onClick={() => setShowChangePassword(false)}
                className="btn btn-secondary w-full"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
