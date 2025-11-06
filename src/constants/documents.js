/**
 * Document Status Constants
 */

export const DOCUMENT_STATUS = {
  UPLOADING: "Uploading",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  ERROR: "Error",
};

export const STATUS_MESSAGES = {
  Uploading: "Đang tải lên...",
  Processing: "Đang xử lý tài liệu...",
  Completed: "Hoàn tất",
  Error: "Lỗi xử lý",
};

export const STATUS_COLORS = {
  Uploading: "#3b82f6",
  Processing: "#f59e0b",
  Completed: "#22c55e",
  Error: "#ef4444",
};

export const UPLOAD_CONSTRAINTS = {
  maxFileSize: 20 * 1024 * 1024, // 20MB
  allowedTypes: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
  ],
  allowedExtensions: [".pdf", ".docx", ".doc", ".txt"],
};
