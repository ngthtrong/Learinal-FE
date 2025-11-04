/**
 * Reset Password Page
 * User sets a new password using token from email
 */

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button, Input } from "@components/common";
import { isValidPassword } from "@utils/validators";
import { authService } from "@services/api";
import "./ResetPasswordPage.css";
import logoLight from "@/assets/images/logo/learinal-logo-light.png";
import logoDark from "@/assets/images/logo/learinal-logo-dark.png";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const isDark = useMemo(() => {
    try {
      return (
        (document.documentElement.getAttribute("data-theme") || "light").toLowerCase() === "dark"
      );
    } catch {
      return false;
    }
  }, []);

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

    const token = searchParams.get("token");
    if (!token) {
      setError("Thiếu token. Vui lòng mở lại liên kết trong email.");
      return;
    }

    if (!password) {
      setError("Mật khẩu là bắt buộc");
      return;
    }
    if (!isValidPassword(password)) {
      setError("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số");
      return;
    }
    if (!confirmPassword || password !== confirmPassword) {
      setError("Xác nhận mật khẩu không khớp");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setSuccess("Đặt lại mật khẩu thành công. Đang chuyển về trang đăng nhập...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-root">
      <div className="reset-page">
        <div className="reset-card card">
          <header className="reset-brand">
            <img src={isDark ? logoDark : logoLight} alt="Learinal" className="brand-logo" />
            <div className="brand-title">
              <span className="brand-le">Lear</span>
              <span className="brand-inal">inal</span>
            </div>
          </header>

          <div className="reset-header">
            <h1>Đặt lại mật khẩu</h1>
            <p className="muted">Nhập mật khẩu mới của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="reset-form">
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <Input
              label="Mật khẩu mới"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Input
              label="Xác nhận mật khẩu"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="large"
              loading={loading}
              className="reset-button"
            >
              Cập nhật mật khẩu
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

export default ResetPasswordPage;
