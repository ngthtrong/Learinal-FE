/**
 * Formatter Utilities
 * Helper functions for formatting data
 */

/**
 * Format date to readable string
 */
export const formatDate = (date, locale = "vi-VN") => {
  if (!date) return "";
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format date and time to readable string
 */
export const formatDateTime = (date, locale = "vi-VN") => {
  if (!date) return "";
  return new Date(date).toLocaleString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatTime = (date, locale = "vi-VN") => {
  if (!date) return "";
  return new Date(date).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

export const formatDuration = (seconds) => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Format number with thousand separators
 */
export const formatNumber = (number, locale = "vi-VN") => {
  if (number === null || number === undefined) return "0";
  return new Intl.NumberFormat(locale).format(number);
};

/**
 * Format currency (VND)
 */
export const formatCurrency = (amount, currency = "VND", locale = "vi-VN") => {
  if (amount === null || amount === undefined) return "0 ₫";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Capitalize first letter
 */
export const capitalize = (text) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date, locale = "vi-VN") => {
  if (!date) return "";

  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return "vừa xong";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`;

  return formatDate(date, locale);
};

export default {
  formatDate,
  formatDateTime,
  formatTime,
  formatDuration,
  formatNumber,
  formatCurrency,
  formatFileSize,
  truncateText,
  capitalize,
  formatRelativeTime,
};
