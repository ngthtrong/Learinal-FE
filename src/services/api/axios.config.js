/**
 * Axios Configuration
 * Setup axios instance with interceptors for authentication and error handling
 */

import axios from "axios";
import { API_CONFIG } from "../../config/api.config";
import { APP_CONFIG } from "../../config/app.config";
import { logError } from "../../utils/errorHandler";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true, // Send cookies with cross-origin requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Token refresh state management
let isRefreshing = false;
let refreshSubscribers = [];

/**
 * Subscribe to token refresh completion
 */
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

/**
 * Notify all subscribers when refresh completes
 */
const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

/**
 * Parse JWT to get expiration time
 */
const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

/**
 * Check if token is about to expire (within 5 minutes)
 */
const isTokenExpiringSoon = (token) => {
  if (!token) return true;

  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return true;

  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  const timeUntilExpiration = expirationTime - currentTime;

  // Refresh if less than 5 minutes remaining
  return timeUntilExpiration < 5 * 60 * 1000;
};

/**
 * Proactively refresh token if needed
 */
const refreshTokenIfNeeded = async () => {
  const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);

  if (isTokenExpiringSoon(token) && !isRefreshing) {
    isRefreshing = true;

    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN}`,
        {},
        {
          withCredentials: true,
          headers: { "X-Requested-By": "web" },
        }
      );

      const { accessToken } = response.data || {};
      if (accessToken) {
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, accessToken);
        onTokenRefreshed(accessToken);
      }
    } catch (error) {
      console.error("Proactive token refresh failed:", error);
      // Don't logout here, let the 401 interceptor handle it
    } finally {
      isRefreshing = false;
    }
  }
};

// Request interceptor - Add auth token and proactive refresh
axiosInstance.interceptors.request.use(
  async (config) => {
    // Proactively refresh token if expiring soon
    await refreshTokenIfNeeded();

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

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      isRefreshing = true;

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

        // Notify all waiting requests
        onTokenRefreshed(accessToken);
        isRefreshing = false;

        // Retry original request with new token
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        // Refresh failed - redirect to login
        logError(refreshError, "Token Refresh Failed");
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_DATA);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Log non-auth errors
    if (error.response?.status !== 401) {
      logError(error, `API Error: ${error.config?.url || "Unknown URL"}`);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
