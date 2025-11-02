/**
 * Auth Service
 * Handles all authentication-related API calls
 */

import axiosInstance from "./axios.config";
import { API_CONFIG } from "../../config/api.config";

export const authService = {
  /**
   * Login with email and password
   */
  login: async (email, password) => {
    const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });
    return response.data;
  },

  /**
   * Register new user
   */
  register: async (userData) => {
    const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async () => {
    const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async () => {
    // Cookie-based refresh (no body), include anti-CSRF header
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN,
      {},
      { headers: { "X-Requested-By": "web" } }
    );
    return response.data;
  },

  /**
   * Request password reset
   */
  forgotPassword: async (email) => {
    const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      email,
    });
    return response.data;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token, newPassword) => {
    const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      newPassword,
    });
    return response.data;
  },

  /**
   * Verify email address
   */
  verifyEmail: async (token) => {
    const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL, {
      token,
    });
    return response.data;
  },

  /**
   * OAuth Google login
   */
  googleOAuth: async (code) => {
    const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.OAUTH_GOOGLE, {
      code,
    });
    return response.data;
  },
};

export default authService;
