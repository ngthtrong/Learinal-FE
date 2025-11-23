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
    const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.USERS.PROFILE);
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
    const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.USERS.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  /**
   * Get user preferences
   */
  getPreferences: async () => {
    const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.USERS.PREFERENCES);
    return response.data;
  },

  /**
   * Update user preferences
   */
  updatePreferences: async (preferences) => {
    const response = await axiosInstance.put(API_CONFIG.ENDPOINTS.USERS.PREFERENCES, preferences);
    return response.data;
  },
  /**
   * Get user dashboard stats
   * Aggregates data from various endpoints
   */
  getDashboardStats: async () => {
    try {
      const [docsRes, attemptsRes, setsRes] = await Promise.all([
        axiosInstance.get(API_CONFIG.ENDPOINTS.DOCUMENTS.LIST, {
          params: { page: 1, pageSize: 1 },
        }),
        axiosInstance.get(API_CONFIG.ENDPOINTS.QUIZ_ATTEMPTS.HISTORY, {
          params: { page: 1, pageSize: 100 },
        }),
        axiosInstance.get(API_CONFIG.ENDPOINTS.QUESTION_SETS.LIST, {
          params: { page: 1, pageSize: 1 },
        }),
      ]);

      const attempts = attemptsRes.data.items || [];
      const completedAttempts = attempts.filter((a) => a.status === "completed");

      let avgScore = 0;
      if (completedAttempts.length > 0) {
        const totalScore = completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
        avgScore = Math.round(totalScore / completedAttempts.length);
      }

      return {
        documents: docsRes.data.meta?.total || 0,
        quizzes: setsRes.data.meta?.total || 0,
        completedQuizzes: attemptsRes.data.meta?.total || 0,
        avgScore: avgScore,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats", error);
      throw error;
    }
  },
};

export default usersService;
