/**
 * Language Context
 * Provides multi-language support across the application
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { locales, defaultLocale, supportedLocales } from '@/locales';
import { APP_CONFIG } from '@/config/app.config';

const LanguageContext = createContext(null);

/**
 * Get nested value from object using dot notation
 * @param {object} obj - The object to search
 * @param {string} path - Dot notation path (e.g., 'footer.description')
 * @returns {string|undefined} - The value at path or undefined
 */
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

/**
 * Replace placeholders in string with values
 * @param {string} str - String with placeholders like {key}
 * @param {object} params - Object with key-value pairs to replace
 * @returns {string} - String with replaced values
 */
const interpolate = (str, params = {}) => {
  if (typeof str !== 'string') return str;
  return str.replace(/{(\w+)}/g, (match, key) => {
    return params[key] !== undefined ? params[key] : match;
  });
};

export const LanguageProvider = ({ children }) => {
  // Get initial language from localStorage or browser settings
  const getInitialLanguage = () => {
    // Check localStorage first
    const savedLanguage = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.LANGUAGE);
    if (savedLanguage && locales[savedLanguage]) {
      return savedLanguage;
    }

    // Check browser language
    const browserLanguage = navigator.language?.split('-')[0];
    if (browserLanguage && locales[browserLanguage]) {
      return browserLanguage;
    }

    // Fallback to default
    return defaultLocale;
  };

  const [language, setLanguageState] = useState(getInitialLanguage);
  const [translations, setTranslations] = useState(locales[getInitialLanguage()] || locales[defaultLocale]);

  // Update translations when language changes
  useEffect(() => {
    const newTranslations = locales[language] || locales[defaultLocale];
    setTranslations(newTranslations);
    
    // Update document language attribute
    document.documentElement.lang = language;
    
    // Save to localStorage
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.LANGUAGE, language);
  }, [language]);

  /**
   * Change the current language
   * @param {string} newLanguage - Language code (e.g., 'en', 'vi')
   */
  const setLanguage = useCallback((newLanguage) => {
    if (locales[newLanguage]) {
      setLanguageState(newLanguage);
    } else {
      console.warn(`Language '${newLanguage}' is not supported. Available: ${Object.keys(locales).join(', ')}`);
    }
  }, []);

  /**
   * Toggle between available languages
   */
  const toggleLanguage = useCallback(() => {
    const currentIndex = supportedLocales.findIndex(l => l.code === language);
    const nextIndex = (currentIndex + 1) % supportedLocales.length;
    setLanguage(supportedLocales[nextIndex].code);
  }, [language, setLanguage]);

  /**
   * Get translation by key
   * @param {string} key - Translation key using dot notation (e.g., 'footer.description')
   * @param {object} params - Optional parameters for interpolation
   * @returns {string} - Translated string or key if not found
   */
  const t = useCallback((key, params = {}) => {
    const translation = getNestedValue(translations, key);
    
    if (translation === undefined) {
      // Fallback to default locale
      const fallbackTranslation = getNestedValue(locales[defaultLocale], key);
      if (fallbackTranslation !== undefined) {
        return interpolate(fallbackTranslation, params);
      }
      // Return key if no translation found
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    
    return interpolate(translation, params);
  }, [translations]);

  /**
   * Check if a translation key exists
   * @param {string} key - Translation key
   * @returns {boolean}
   */
  const hasTranslation = useCallback((key) => {
    return getNestedValue(translations, key) !== undefined;
  }, [translations]);

  /**
   * Get current locale info
   */
  const currentLocale = useMemo(() => {
    return supportedLocales.find(l => l.code === language) || supportedLocales[0];
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    toggleLanguage,
    t,
    hasTranslation,
    currentLocale,
    supportedLocales,
    isVietnamese: language === 'vi',
    isEnglish: language === 'en',
  }), [language, setLanguage, toggleLanguage, t, hasTranslation, currentLocale]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Hook to use language context
 * @returns {object} Language context value
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

/**
 * Hook for translations (shorthand)
 * @returns {Function} Translation function
 */
export const useTranslation = () => {
  const { t, language } = useLanguage();
  return { t, language };
};

export default LanguageContext;
