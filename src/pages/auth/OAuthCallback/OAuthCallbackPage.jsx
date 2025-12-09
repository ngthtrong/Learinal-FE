/**
 * OAuth Callback Page
 * Handles OAuth redirect callback
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import { useToast } from "@components/common";
import { oauthService } from "@services/api";
import { APP_CONFIG } from "@config/app.config";
import { getErrorMessage, logError } from "@utils/errorHandler";

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updateUser } = useAuth();
  const toast = useToast();
  const [status, setStatus] = useState("processing");
  const [error, setError] = useState("");

  const handleOAuthCallback = async () => {
    try {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      // Prevent duplicate processing in React StrictMode (dev) or double navigations
      const processedKey = "oauth_processed_code";
      const lastProcessed = sessionStorage.getItem(processedKey);

      if (lastProcessed) {
        const { code: lastCode, timestamp } = JSON.parse(lastProcessed);
        const timeSinceProcessed = Date.now() - timestamp;

        // If same code was processed within last 5 seconds, skip
        if (lastCode === code && timeSinceProcessed < 5000) {
          console.log("Duplicate OAuth callback detected, skipping...");
          return;
        }
      }

      // Mark this code as processed
      sessionStorage.setItem(processedKey, JSON.stringify({ code, timestamp: Date.now() }));

      // Handle OAuth errors from provider
      if (errorParam) {
        logError(
          new Error(`OAuth Error: ${errorParam} - ${errorDescription}`),
          "OAuth Provider Error"
        );

        setStatus("error");

        let errorMessage = "Đăng nhập thất bại";
        switch (errorParam) {
          case "access_denied":
            errorMessage = "Bạn đã từ chối quyền truy cập";
            break;
          case "invalid_request":
            errorMessage = "Yêu cầu không hợp lệ";
            break;
          case "unauthorized_client":
            errorMessage = "Ứng dụng không được phép truy cập";
            break;
          case "unsupported_response_type":
            errorMessage = "Loại phản hồi không được hỗ trợ";
            break;
          case "invalid_scope":
            errorMessage = "Phạm vi quyền không hợp lệ";
            break;
          case "server_error":
            errorMessage = "Lỗi máy chủ OAuth";
            break;
          case "temporarily_unavailable":
            errorMessage = "Dịch vụ OAuth tạm thời không khả dụng";
            break;
          default:
            errorMessage = errorDescription || `Lỗi: ${errorParam}`;
        }

        setError(errorMessage);
        toast.showError(errorMessage);
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      // Validate required parameters
      if (!code) {
        throw new Error("Missing authorization code");
      }

      if (!state) {
        throw new Error("Missing state parameter");
      }

      // Validate state parameter
      const savedState = sessionStorage.getItem("oauth_state");
      if (!savedState) {
        throw new Error("No saved state found - please try logging in again");
      }

      if (state !== savedState) {
        throw new Error("State mismatch - possible CSRF attack detected");
      }

      // Exchange code for tokens
      const response = await oauthService.handleCallback(code, state);

      if (!response || !response.accessToken || !response.user) {
        throw new Error("Invalid response from server - missing tokens or user data");
      }

      // Save tokens and user data
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, response.accessToken);
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));

      // Update auth context
      updateUser(response.user);

      setStatus("success");
      toast.showSuccess("Đăng nhập thành công!");

      // Clean up processed code after successful login
      sessionStorage.removeItem(processedKey);

      // Redirect based on role
      setTimeout(() => {
        const role = response?.user?.role;
        let next = "/dashboard";
        if (role === "Learner") next = "/home";
        else if (role === "Admin") next = "/admin";
        else if (role === "Expert") next = "/expert";
        navigate(next, { replace: true });
      }, 1500);
    } catch (err) {
      logError(err, "OAuth Callback Handler");
      console.error("OAuth callback error:", err);

      setStatus("error");
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      toast.showError(errorMsg);

      // Clean up on error
      sessionStorage.removeItem("oauth_state");
      sessionStorage.removeItem("oauth_code_verifier");
      sessionStorage.removeItem("oauth_processed_code");

      setTimeout(() => navigate("/login", { replace: true }), 3000);
    }
  };

  useEffect(() => {
    handleOAuthCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-large p-6 sm:p-8 md:p-12 max-w-md w-full text-center">
        {status === "processing" && (
          <div className="space-y-3 sm:space-y-4">
            <div className="inline-block w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Đang xử lý đăng nhập...</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Vui lòng đợi trong giây lát</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-3 sm:space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900/30 rounded-full text-2xl sm:text-4xl text-green-600 dark:text-green-400">
              ✓
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Đăng nhập thành công!</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Đang chuyển hướng...</p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-3 sm:space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-red-100 dark:bg-red-900/30 rounded-full text-2xl sm:text-4xl text-red-600 dark:text-red-400">
              ✗
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Đăng nhập thất bại</h2>
            <p className="text-sm sm:text-base text-red-600 dark:text-red-400">{error}</p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Đang quay lại trang đăng nhập...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
