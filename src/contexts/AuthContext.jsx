/**
 * Auth Context
 * Provides authentication state and methods throughout the app
 */

import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/api";
import { APP_CONFIG } from "../config/app.config";

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      const userData = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_DATA);

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Failed to parse user data:", error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const { accessToken, refreshToken, user: userData } = response;

      // Save tokens and user data
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, accessToken);
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(
        APP_CONFIG.STORAGE_KEYS.USER_DATA,
        JSON.stringify(userData)
      );

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return { success: true, data: response };
    } catch (error) {
      console.error("Registration failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage
      localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_DATA);

      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem(
      APP_CONFIG.STORAGE_KEYS.USER_DATA,
      JSON.stringify(userData)
    );
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
