/**
 * Language Switcher Component
 * Dropdown or button group for switching languages
 */

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Language Switcher - Dropdown variant
 */
export function LanguageSwitcherDropdown({ className = '' }) {
  const { language, setLanguage, supportedLocales, currentLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>{currentLocale.flag}</span>
        <span className="hidden sm:inline">{currentLocale.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          {supportedLocales.map((locale) => (
            <button
              key={locale.code}
              onClick={() => handleLanguageChange(locale.code)}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                language === locale.code
                  ? 'text-primary-600 dark:text-primary-400 font-semibold bg-primary-50 dark:bg-primary-900/20'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <span>{locale.flag}</span>
              <span>{locale.name}</span>
              {language === locale.code && (
                <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Language Switcher - Toggle variant (for 2 languages)
 */
export function LanguageSwitcherToggle({ className = '' }) {
  const { language, toggleLanguage, currentLocale } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${className}`}
      aria-label={`Current language: ${currentLocale.name}. Click to switch.`}
    >
      <span>{currentLocale.flag}</span>
      <span className="hidden sm:inline">{language.toUpperCase()}</span>
    </button>
  );
}

/**
 * Language Switcher - Inline buttons variant
 */
export function LanguageSwitcherInline({ className = '', showFlags = true, showNames = true }) {
  const { language, setLanguage, supportedLocales } = useLanguage();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {supportedLocales.map((locale, index) => (
        <div key={locale.code} className="flex items-center">
          {index > 0 && <span className="text-gray-300 dark:text-gray-600 mx-2">|</span>}
          <button
            onClick={() => setLanguage(locale.code)}
            className={`text-sm transition-colors ${
              language === locale.code
                ? 'text-primary-600 dark:text-primary-400 font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
            }`}
          >
            {showFlags && <span className="mr-1">{locale.flag}</span>}
            {showNames && <span>{locale.name}</span>}
          </button>
        </div>
      ))}
    </div>
  );
}

/**
 * Language Icon Button - minimal variant
 */
export function LanguageIconButton({ className = '' }) {
  const { toggleLanguage, currentLocale } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className={`p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors ${className}`}
      aria-label={`Switch language. Current: ${currentLocale.name}`}
      title={currentLocale.name}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
        />
      </svg>
    </button>
  );
}

export default LanguageSwitcherDropdown;
