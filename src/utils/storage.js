/**
 * Storage Utilities
 * Helper functions for localStorage and sessionStorage
 */

import { APP_CONFIG } from "../config/app.config";

/**
 * Get item from localStorage
 */
export const getStorageItem = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting item ${key} from localStorage:`, error);
    return null;
  }
};

/**
 * Set item in localStorage
 */
export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting item ${key} in localStorage:`, error);
    return false;
  }
};

/**
 * Remove item from localStorage
 */
export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing item ${key} from localStorage:`, error);
    return false;
  }
};

/**
 * Clear all items from localStorage
 */
export const clearStorage = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error("Error clearing localStorage:", error);
    return false;
  }
};

/**
 * Get auth token from localStorage
 */
export const getAuthToken = () => {
  return localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Set auth token in localStorage
 */
export const setAuthToken = (token) => {
  localStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
};

/**
 * Remove auth token from localStorage
 */
export const removeAuthToken = () => {
  localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
};

export default {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearStorage,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
};
