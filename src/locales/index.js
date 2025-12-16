/**
 * Locales Index
 * Export all language files
 */

import vi from './vi.json';
import en from './en.json';

export const locales = {
  vi,
  en,
};

export const defaultLocale = 'vi';

export const supportedLocales = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

export default locales;
