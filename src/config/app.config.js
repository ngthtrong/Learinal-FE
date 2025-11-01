/**
 * Application Configuration
 * General app settings and constants
 */

export const APP_CONFIG = {
  APP_NAME: "Learinal",
  APP_VERSION: "1.0.0",
  APP_DESCRIPTION: "AI-Powered Learning Platform",

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],

  // File Upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ["pdf", "doc", "docx", "txt", "ppt", "pptx"],

  // Quiz Settings
  DEFAULT_QUIZ_TIME_LIMIT: 30, // minutes
  QUESTIONS_PER_QUIZ: 10,

  // Local Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: "learinal_auth_token",
    REFRESH_TOKEN: "learinal_refresh_token",
    USER_DATA: "learinal_user_data",
    THEME: "learinal_theme",
    LANGUAGE: "learinal_language",
  },

  // Supported Languages
  LANGUAGES: [
    { code: "en", name: "English" },
    { code: "vi", name: "Tiếng Việt" },
  ],

  // Theme Options
  THEMES: ["light", "dark", "auto"],

  // User Roles
  USER_ROLES: {
    STUDENT: "student",
    EDUCATOR: "educator",
    REVIEWER: "reviewer",
    ADMIN: "admin",
  },

  // Subscription Tiers
  SUBSCRIPTION_TIERS: {
    FREE: "free",
    PREMIUM: "premium",
    ENTERPRISE: "enterprise",
  },
};

export default APP_CONFIG;
