/**
 * Error Handler Utilities
 * Standardized error processing and message formatting
 */

/**
 * Extract user-friendly error message from API error response
 * @param {Error|Object} error - The error object from axios or other sources
 * @returns {string} - User-friendly error message
 */
export const getErrorMessage = (error) => {
  // Network errors
  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return "Yêu cầu hết thời gian chờ. Vui lòng kiểm tra kết nối mạng.";
    }
    if (error.message === "Network Error") {
      return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
    }
    return "Đã xảy ra lỗi kết nối. Vui lòng thử lại.";
  }

  const { status, data } = error.response;

  // Use backend error message if available
  if (data?.message) {
    return data.message;
  }

  // Use backend error field if available
  if (data?.error) {
    return typeof data.error === "string" ? data.error : "Đã xảy ra lỗi không xác định.";
  }

  // Fallback to status code messages
  switch (status) {
    case 400:
      return "Yêu cầu không hợp lệ. Vui lòng kiểm tra thông tin đã nhập.";
    case 401:
      return "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
    case 403:
      return "Bạn không có quyền thực hiện thao tác này.";
    case 404:
      return "Không tìm thấy dữ liệu yêu cầu.";
    case 409:
      return "Dữ liệu đã tồn tại hoặc xung đột.";
    case 422:
      return "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
    case 429:
      return "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.";
    case 500:
      return "Lỗi máy chủ. Vui lòng thử lại sau.";
    case 502:
      return "Máy chủ tạm thời không khả dụng. Vui lòng thử lại sau.";
    case 503:
      return "Dịch vụ đang bảo trì. Vui lòng thử lại sau.";
    default:
      return `Đã xảy ra lỗi (${status}). Vui lòng thử lại.`;
  }
};

/**
 * Extract validation errors from API response
 * @param {Object} error - The error object from axios
 * @returns {Object|null} - Object with field-specific errors or null
 */
export const getValidationErrors = (error) => {
  if (!error.response?.data) return null;

  const { data } = error.response;

  // Backend validation errors (format: { errors: { field: "message" } })
  if (data.errors && typeof data.errors === "object") {
    return data.errors;
  }

  // Backend validation errors (format: { validationErrors: [...] })
  if (Array.isArray(data.validationErrors)) {
    return data.validationErrors.reduce((acc, err) => {
      acc[err.field || err.path] = err.message;
      return acc;
    }, {});
  }

  return null;
};

/**
 * Check if error is a network error
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export const isNetworkError = (error) => {
  return !error.response && error.message === "Network Error";
};

/**
 * Check if error is a timeout error
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export const isTimeoutError = (error) => {
  return error.code === "ECONNABORTED";
};

/**
 * Check if error is an authentication error
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export const isAuthError = (error) => {
  return error.response?.status === 401;
};

/**
 * Check if error is a permission error
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export const isPermissionError = (error) => {
  return error.response?.status === 403;
};

/**
 * Check if error is a validation error
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export const isValidationError = (error) => {
  return error.response?.status === 422 || error.response?.status === 400;
};

/**
 * Check if error is a rate limit error
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export const isRateLimitError = (error) => {
  return error.response?.status === 429;
};

/**
 * Log error to console (development) or error tracking service (production)
 * @param {Error} error - The error object
 * @param {string} context - Context where error occurred
 */
export const logError = (error, context = "") => {
  const errorInfo = {
    context,
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  };

  if (import.meta.env.DEV) {
    console.error("🔴 Error:", errorInfo);
  } else {
    // In production, send to error tracking service (e.g., Sentry)
    // Sentry.captureException(error, { extra: errorInfo });
    console.error("Error:", errorInfo);
  }
};
