/**
 * User Roles Constants
 * Defines all user roles in the system
 */

export const USER_ROLES = {
  STUDENT: "student",
  EDUCATOR: "educator",
  REVIEWER: "reviewer",
  ADMIN: "admin",
};

export const ROLE_LABELS = {
  [USER_ROLES.STUDENT]: "Học viên",
  [USER_ROLES.EDUCATOR]: "Giảng viên",
  [USER_ROLES.REVIEWER]: "Người duyệt",
  [USER_ROLES.ADMIN]: "Quản trị viên",
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.STUDENT]: [
    "view_documents",
    "upload_documents",
    "take_quizzes",
    "view_results",
  ],
  [USER_ROLES.EDUCATOR]: [
    "view_documents",
    "upload_documents",
    "create_questions",
    "create_subjects",
    "take_quizzes",
    "view_results",
    "view_analytics",
  ],
  [USER_ROLES.REVIEWER]: [
    "view_documents",
    "review_content",
    "approve_content",
    "reject_content",
    "view_validation_requests",
  ],
  [USER_ROLES.ADMIN]: [
    "manage_users",
    "manage_subscriptions",
    "view_all_content",
    "manage_content",
    "view_system_stats",
    "manage_settings",
  ],
};

export default USER_ROLES;
