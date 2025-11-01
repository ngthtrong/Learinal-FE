/**
 * Status Constants
 * Defines all status types used in the application
 */

// Document Status
export const DOCUMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
};

export const DOCUMENT_STATUS_LABELS = {
  [DOCUMENT_STATUS.PENDING]: "Đang chờ",
  [DOCUMENT_STATUS.PROCESSING]: "Đang xử lý",
  [DOCUMENT_STATUS.COMPLETED]: "Hoàn thành",
  [DOCUMENT_STATUS.FAILED]: "Thất bại",
};

// Quiz Attempt Status
export const QUIZ_STATUS = {
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  EXPIRED: "expired",
};

export const QUIZ_STATUS_LABELS = {
  [QUIZ_STATUS.IN_PROGRESS]: "Đang làm",
  [QUIZ_STATUS.COMPLETED]: "Đã hoàn thành",
  [QUIZ_STATUS.EXPIRED]: "Hết hạn",
};

// Validation Request Status
export const VALIDATION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const VALIDATION_STATUS_LABELS = {
  [VALIDATION_STATUS.PENDING]: "Chờ duyệt",
  [VALIDATION_STATUS.APPROVED]: "Đã duyệt",
  [VALIDATION_STATUS.REJECTED]: "Đã từ chối",
};

// Subscription Status
export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
};

export const SUBSCRIPTION_STATUS_LABELS = {
  [SUBSCRIPTION_STATUS.ACTIVE]: "Đang hoạt động",
  [SUBSCRIPTION_STATUS.INACTIVE]: "Không hoạt động",
  [SUBSCRIPTION_STATUS.CANCELLED]: "Đã hủy",
  [SUBSCRIPTION_STATUS.EXPIRED]: "Đã hết hạn",
};

// Notification Status
export const NOTIFICATION_STATUS = {
  UNREAD: "unread",
  READ: "read",
};

export default {
  DOCUMENT_STATUS,
  DOCUMENT_STATUS_LABELS,
  QUIZ_STATUS,
  QUIZ_STATUS_LABELS,
  VALIDATION_STATUS,
  VALIDATION_STATUS_LABELS,
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_STATUS_LABELS,
  NOTIFICATION_STATUS,
};
