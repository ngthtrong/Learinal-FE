/**
 * Theme Toggle Component
 * Button to switch between light and dark mode
 */

import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { SunIcon, MoonIcon } from "@/components/icons";

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  const label = theme === "light" 
    ? t("components.themeToggle.switchToDark") 
    : t("components.themeToggle.switchToLight");

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 ${className}`}
      aria-label={label}
      title={label}
    >
      {theme === "light" ? (
        <MoonIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      ) : (
        <SunIcon className="w-5 h-5 text-yellow-500" />
      )}
    </button>
  );
};

export default ThemeToggle;
