/**
 * Users Service
 * Handles all user-related API calls
 */

import axiosInstance from "./axios.config";
import { API_CONFIG } from "../../config/api.config";

export const usersService = {
  /**
   * Get current user profile
   */
  getProfile: async () => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.USERS.PROFILE
    );
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (profileData) => {
    const response = await axiosInstance.put(
      API_CONFIG.ENDPOINTS.USERS.UPDATE_PROFILE,
      profileData
    );
    return response.data;
  },

  /**
   * Change user password
   */
  changePassword: async (currentPassword, newPassword) => {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.USERS.CHANGE_PASSWORD,
      {
        currentPassword,
        newPassword,
      }
    );
    return response.data;
  },

  /**
   * Get user preferences
   */
  getPreferences: async () => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.USERS.PREFERENCES
    );
    return response.data;
  },

  /**
   * Update user preferences
   */
  updatePreferences: async (preferences) => {
    const response = await axiosInstance.put(
      API_CONFIG.ENDPOINTS.USERS.PREFERENCES,
      preferences
    );
    return response.data;
  },
};

export default usersService;
