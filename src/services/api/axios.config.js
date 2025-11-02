/**
 * Axios Configuration
 * Setup axios instance with interceptors for authentication and error handling
 */

import axios from "axios";
import { API_CONFIG } from "../../config/api.config";
import { APP_CONFIG } from "../../config/app.config";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true, // Send cookies with cross-origin requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh (cookie-based)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Use cookie-based refresh flow: send X-Requested-By and rely on HttpOnly cookie
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN}`,
          {},
          {
            withCredentials: true,
            headers: { "X-Requested-By": "web" },
          }
        );

        const { accessToken } = response.data || {};
        if (!accessToken) throw new Error("No accessToken in refresh response");
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, accessToken);

        // Retry original request with new token
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_DATA);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
