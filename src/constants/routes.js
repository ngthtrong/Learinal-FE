/**
 * Routes Constants
 * Defines all application routes
 */

export const ROUTES = {
  // Public routes
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",

  // Dashboard
  DASHBOARD: "/dashboard",

  // Documents
  DOCUMENTS: "/documents",
  DOCUMENT_DETAIL: "/documents/:id",
  // Document upload is now integrated into subject detail page

  // Subjects
  SUBJECTS: "/subjects",
  SUBJECT_DETAIL: "/subjects/:id",

  // Quiz
  QUIZ: "/quiz",
  QUIZ_START_WITH_ID: "/quiz/start/:id",
  QUIZ_TAKE: "/quiz/take/:attemptId",
  QUIZ_RESULT: "/quiz/result/:attemptId",
  QUIZ_HISTORY: "/quiz/history",

  // Questions
  QUESTIONS: "/questions",
  QUESTION_SETS: "/question-sets",
  QUESTION_SET_DETAIL: "/question-sets/:id",
  QUESTION_GENERATE: "/questions/generate",

  // Profile
  PROFILE: "/profile",
  PROFILE_EDIT: "/profile/edit",
  PROFILE_SETTINGS: "/profile/settings",

  // Subscriptions
  SUBSCRIPTIONS: "/subscriptions",
  SUBSCRIPTION_PLANS: "/subscriptions/plans",
  SUBSCRIPTION_MANAGE: "/subscriptions/manage",

  // Notifications
  NOTIFICATIONS: "/notifications",

  // Admin
  ADMIN: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_STATS: "/admin/stats",
  ADMIN_VALIDATION: "/admin/validation",
  ADMIN_SETTINGS: "/admin/settings",

  // Error pages
  NOT_FOUND: "/404",
  UNAUTHORIZED: "/401",
  FORBIDDEN: "/403",
};

/**
 * Generate route path with parameters
 */
export const generatePath = (route, params = {}) => {
  let path = route;
  Object.keys(params).forEach((key) => {
    path = path.replace(`:${key}`, params[key]);
  });
  return path;
};

export default ROUTES;
