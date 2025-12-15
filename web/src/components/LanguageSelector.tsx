import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { setLanguage, type Language } from '@/app/slices/languageSlice';

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const dispatch = useAppDispatch();

  const currentLanguage = (i18n.language as Language) || 'en';

  const languages: { code: Language; ariaLabel: string; flag: string }[] = [
    { code: 'en', ariaLabel: 'Switch language to English', flag: '🇺🇸' },
    { code: 'he', ariaLabel: 'החלף שפה לעברית', flag: '🇮🇱' },
  ];

  const handleLanguageChange = (lang: Language) => {
    i18n.changeLanguage(lang);
    dispatch(setLanguage(lang));
  };

  return (
    <>
      <label className="sr-only" htmlFor="language-select">Language</label>
      <select
        id="language-select"
        value={currentLanguage}
        onChange={(e) => handleLanguageChange(e.target.value as Language)}
        aria-label="Language selector"
        className="h-8 w-12 text-base bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} aria-label={lang.ariaLabel}>
            {lang.flag}
          </option>
        ))}
      </select>
    </>
  );
}
