/**
 * Forgot Password Page
 * Request password reset via email
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Input } from "@components/common";
import { isValidEmail } from "@utils/validators";
import { authService } from "@services/api";
import { APP_CONFIG } from "@config/app.config";
import "./ForgotPasswordPage.css";
import logoLight from "@/assets/images/logo/learinal-logo-light.png";
import logoDark from "@/assets/images/logo/learinal-logo-dark.png";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("light");

  // Initialize theme from global app preference (no toggle at forgot-password)
  useEffect(() => {
    const globalTheme = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.THEME);
    if (globalTheme === "dark") setTheme("dark");
  }, []);

  useEffect(() => {
    const root = document.getElementById("forgotRoot");
    if (root) root.setAttribute("data-theme", theme);
  }, [theme]);

  // Prevent zoom interactions while on this page
  useEffect(() => {
    const preventKeyZoom = (e) => {
      if ((e.ctrlKey || e.metaKey) && ["+", "=", "-", "0"].includes(e.key)) {
        e.preventDefault();
      }
    };
    const preventWheelZoom = (e) => {
      if (e.ctrlKey) e.preventDefault();
    };
    const preventGesture = (e) => e.preventDefault();
    window.addEventListener("keydown", preventKeyZoom, { passive: false });
    window.addEventListener("wheel", preventWheelZoom, { passive: false });
    document.addEventListener("gesturestart", preventGesture, { passive: false });
    document.addEventListener("gesturechange", preventGesture, { passive: false });
    document.addEventListener("gestureend", preventGesture, { passive: false });
    return () => {
      window.removeEventListener("keydown", preventKeyZoom);
      window.removeEventListener("wheel", preventWheelZoom);
      document.removeEventListener("gesturestart", preventGesture);
      document.removeEventListener("gesturechange", preventGesture);
      document.removeEventListener("gestureend", preventGesture);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email là bắt buộc");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Email không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSuccess("Đã gửi email đặt lại mật khẩu (nếu email tồn tại)");
    } catch (err) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="forgotRoot" className="forgot-root" data-theme={theme}>
      <div className="forgot-page">
        <div className="forgot-card card">
          <header className="forgot-brand">
            <img
              src={theme === "dark" ? logoDark : logoLight}
              alt="Learinal"
              className="brand-logo"
            />
            <div className="brand-title">
              <span className="brand-le">Lear</span>
              <span className="brand-inal">inal</span>
            </div>
          </header>

          <div className="forgot-header">
            <h1>Quên mật khẩu</h1>
            <p className="muted">Nhập email để nhận liên kết đặt lại mật khẩu</p>
          </div>

          <form onSubmit={handleSubmit} className="forgot-form">
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <Input
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="large"
              loading={loading}
              className="forgot-button"
            >
              Gửi liên kết đặt lại
            </Button>

            <p className="back-link">
              Quay lại <Link to="/login">Đăng nhập</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
