/**
 * Validation Utilities
 * Helper functions for form validation
 */

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validate phone number (Vietnamese format)
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^(0|\+84)[0-9]{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Check if string is empty or whitespace
 */
export const isEmpty = (value) => {
  return !value || value.trim().length === 0;
};

/**
 * Validate minimum length
 */
export const minLength = (value, min) => {
  return value && value.length >= min;
};

/**
 * Validate maximum length
 */
export const maxLength = (value, max) => {
  return value && value.length <= max;
};

/**
 * Validate URL format
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate file size
 */
export const isValidFileSize = (file, maxSizeInMB) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

/**
 * Validate file type
 */
export const isValidFileType = (file, allowedTypes) => {
  const fileExtension = file.name.split(".").pop().toLowerCase();
  return allowedTypes.includes(fileExtension);
};

export default {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isEmpty,
  minLength,
  maxLength,
  isValidUrl,
  isValidFileSize,
  isValidFileType,
};
