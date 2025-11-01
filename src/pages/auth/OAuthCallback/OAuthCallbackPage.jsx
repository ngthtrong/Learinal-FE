/**
 * OAuth Callback Page
 * Handles OAuth redirect callback
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { oauthService } from "../../services/api";
import { APP_CONFIG } from "../../config/app.config";
import "./OAuthCallbackPage.css";

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updateUser } = useAuth();
  const [status, setStatus] = useState("processing");
  const [error, setError] = useState("");

  const handleOAuthCallback = async () => {
    try {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (errorParam) {
        setStatus("error");
        setError(
          errorParam === "access_denied"
            ? "Bạn đã từ chối quyền truy cập"
            : `Đăng nhập thất bại: ${errorDescription || errorParam}`
        );
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      if (!code || !state) {
        setStatus("error");
        setError("Thiếu thông tin xác thực");
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      // Exchange code for tokens
      const response = await oauthService.handleCallback(code, state);

      if (response.accessToken && response.user) {
        // Save tokens and user data
        localStorage.setItem(
          APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN,
          response.accessToken
        );
        localStorage.setItem(
          APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN,
          response.refreshToken
        );
        localStorage.setItem(
          APP_CONFIG.STORAGE_KEYS.USER_DATA,
          JSON.stringify(response.user)
        );

        // Update auth context
        updateUser(response.user);

        setStatus("success");

        // Redirect to dashboard
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("OAuth callback error:", err);
      setStatus("error");
      setError(err.message || "Có lỗi xảy ra khi xác thực");
      setTimeout(() => navigate("/login"), 3000);
    }
  };

  useEffect(() => {
    handleOAuthCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="oauth-callback-page">
      <div className="callback-container">
        {status === "processing" && (
          <>
            <div className="spinner"></div>
            <h2>Đang xử lý đăng nhập...</h2>
            <p>Vui lòng đợi trong giây lát</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="success-icon">✓</div>
            <h2>Đăng nhập thành công!</h2>
            <p>Đang chuyển hướng...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="error-icon">✗</div>
            <h2>Đăng nhập thất bại</h2>
            <p>{error}</p>
            <p className="redirect-text">Đang quay lại trang đăng nhập...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
