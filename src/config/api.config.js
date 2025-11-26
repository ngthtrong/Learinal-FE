/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

// In dev we default to the Vite proxy at /api/v1 so cookies remain same-site
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000,
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register",
      LOGOUT: "/auth/logout",
      // Backend uses /auth/refresh with cookie-based refresh
      REFRESH_TOKEN: "/auth/refresh",
      FORGOT_PASSWORD: "/auth/forgot-password",
      RESET_PASSWORD: "/auth/reset-password",
      VERIFY_EMAIL: "/auth/verify-email",
      RESEND_VERIFICATION: "/auth/resend-verification",
      OAUTH_GOOGLE: "/auth/oauth/google",
    },
    // User endpoints
    USERS: {
      PROFILE: "/users/profile",
      UPDATE_PROFILE: "/users/profile",
      CHANGE_PASSWORD: "/users/change-password",
      PREFERENCES: "/users/preferences",
    },
    // Documents endpoints
    DOCUMENTS: {
      LIST: "/documents",
      CREATE: "/documents",
      GET_BY_ID: (id) => `/documents/${id}`,
      UPDATE: (id) => `/documents/${id}`,
      DELETE: (id) => `/documents/${id}`,
      GET_SUMMARY: (id) => `/documents/${id}/summary`,
    },
    // Subjects endpoints
    SUBJECTS: {
      LIST: "/subjects",
      CREATE: "/subjects",
      GET_BY_ID: (id) => `/subjects/${id}`,
      UPDATE: (id) => `/subjects/${id}`,
      DELETE: (id) => `/subjects/${id}`,
      GENERATE_TOC: (id) => `/subjects/${id}/generate-toc`,
      GENERATE_SUMMARY: (id) => `/subjects/${id}/generate-summary`,
    },
    // Question Sets endpoints
    QUESTION_SETS: {
      LIST: "/question-sets",
      CREATE: "/question-sets",
      GET_BY_ID: (id) => `/question-sets/${id}`,
      UPDATE: (id) => `/question-sets/${id}`,
      DELETE: (id) => `/question-sets/${id}`,
      GENERATE: "/question-sets/generate",
    },
    // Search endpoints
    SEARCH: {
      ROOT: "/search",
      QUESTION_SETS: "/search/question-sets",
    },
    // Quiz Attempts endpoints
    QUIZ_ATTEMPTS: {
      LIST: "/quiz-attempts",
      CREATE: "/quiz-attempts",
      GET_BY_ID: (id) => `/quiz-attempts/${id}`,
      SUBMIT: (id) => `/quiz-attempts/${id}/submit`,
      HISTORY: "/quiz-attempts/history",
    },
    // Subscriptions endpoints
    SUBSCRIPTIONS: {
      PLANS: "/subscription-plans",
      USER_SUBSCRIPTION: "/user-subscriptions",
      SUBSCRIBE: "/user-subscriptions/subscribe",
      CANCEL: "/user-subscriptions/cancel",
      UPGRADE: "/user-subscriptions/upgrade",
    },
    // Notifications endpoints
    NOTIFICATIONS: {
      LIST: "/notifications",
      MARK_READ: (id) => `/notifications/${id}/read`,
      MARK_ALL_READ: "/notifications/mark-all-read",
      DELETE: (id) => `/notifications/${id}`,
    },
    // Admin endpoints
    ADMIN: {
      USERS: "/admin/users",
      STATS: "/admin/stats",
      VALIDATION_REQUESTS: "/admin/validation-requests",
      APPROVE_CONTENT: (id) => `/admin/validation-requests/${id}/approve`,
      REJECT_CONTENT: (id) => `/admin/validation-requests/${id}/reject`,
    },
    // Validation requests (shared for Learner/Expert/Admin scope based on role)
    VALIDATION_REQUESTS: {
      LIST: "/validation-requests",
      GET_BY_ID: (id) => `/validation-requests/${id}`,
      GET_DETAIL: (id) => `/validation-requests/${id}/detail`,
      UPDATE: (id) => `/validation-requests/${id}`,
      COMPLETE: (id) => `/validation-requests/${id}/complete`,
      CLAIM: (id) => `/validation-requests/${id}/claim`,
      REQUEST_REVISION: (id) => `/validation-requests/${id}/request-revision`,
    },
    // Commission records (Expert + Admin)
    COMMISSIONS: {
      LIST: "/commission-records",
      GET_BY_ID: (id) => `/commission-records/${id}`,
      SUMMARY: "/commission-records/summary",
      STATS: "/commission-records/stats",
      CONFIG: "/commission-records/config",
      MARK_PAID: (id) => `/commission-records/${id}/mark-paid`,
    },
    // Health check
    HEALTH: "/health",
  },
};

export default API_CONFIG;
