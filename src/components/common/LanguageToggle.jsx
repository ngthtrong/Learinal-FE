/**
 * Language Toggle Component
 * Button to switch between Vietnamese and English (similar to ThemeToggle)
 */

import { useLanguage } from "@/contexts/LanguageContext";

const LanguageToggle = ({ className = "" }) => {
  const { language, toggleLanguage, t } = useLanguage();

  const label = language === "vi" 
    ? t("components.languageToggle.switchToEnglish") 
    : t("components.languageToggle.switchToVietnamese");

  return (
    <button
      onClick={toggleLanguage}
      className={`p-2 rounded-lg transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 ${className}`}
      aria-label={label}
      title={label}
    >
      <span className="text-base font-medium text-gray-700 dark:text-gray-300 w-5 h-5 flex items-center justify-center">
        {language === "vi" ? "EN" : "VI"}
      </span>
    </button>
  );
};

export default LanguageToggle;
