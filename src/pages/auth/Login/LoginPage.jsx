/**
 * Login Page
 * User login form with validation (restyled to match aigen.html)
 */

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import { Button, Input, useToast } from "@components/common";
import { getErrorMessage } from "@utils/errorHandler";
// Theme is now global via <html data-theme>; no per-page state
import { oauthService } from "@services/api";
import { isValidEmail } from "@utils/validators";
import "./LoginPage.css";
import logoLight from "@/assets/images/logo/learinal-logo-light.png";
import logoDark from "@/assets/images/logo/learinal-logo-dark.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const isDark = useMemo(() => {
    try {
      return (
        (document.documentElement.getAttribute("data-theme") || "light").toLowerCase() === "dark"
      );
    } catch {
      return false;
    }
  }, []);

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail, rememberMe: true }));
    }
  }, []);

  // Attempt to prevent zooming interactions on the login page (best-effort)
  useEffect(() => {
    const preventKeyZoom = (e) => {
      // Block Ctrl/Cmd with +, -, =, 0
      if ((e.ctrlKey || e.metaKey) && ["+", "=", "-", "0"].includes(e.key)) {
        e.preventDefault();
      }
    };
    const preventWheelZoom = (e) => {
      // Block Ctrl + MouseWheel zoom
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };
    const preventGesture = (e) => {
      // iOS Safari gesture events
      e.preventDefault();
    };

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email là bắt buộc";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Handle Remember Me
        if (formData.rememberMe) {
          localStorage.setItem("rememberedEmail", formData.email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        toast.showSuccess("Đăng nhập thành công!");
        const next = result.user?.role === "Learner" ? "/home" : "/dashboard";
        navigate(next);
      } else {
        toast.showError(result.error || "Đăng nhập thất bại");
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      toast.showError(errorMsg);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);

    try {
      const result = await oauthService.initiateGoogleLogin();

      if (!result.success) {
        toast.showError(result.error || "Không thể kết nối với Google");
        setGoogleLoading(false);
      }
      // If successful, redirect happens via OAuth
    } catch (error) {
      console.error("Google login error:", error);
      const errorMsg = getErrorMessage(error);
      toast.showError(errorMsg);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-page">
        <div className="login-card card">
          <header className="login-brand">
            <img src={isDark ? logoDark : logoLight} alt="Learinal" className="brand-logo" />
            <div className="brand-title">
              <span className="brand-le">Lear</span>
              <span className="brand-inal">inal</span>
            </div>
          </header>

          <div className="login-header">
            <h1>Đăng nhập</h1>
            <p className="muted">Truy cập tài khoản Learinal của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="your@email.com"
              required
            />

            <Input
              label="Mật khẩu"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
              required
            />

            <div className="form-options">
              <label className="remember-me-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="remember-me-checkbox"
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>

              <Link to="/forgot-password" className="forgot-link">
                Quên mật khẩu?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="large"
              loading={loading}
              className="login-button"
            >
              Đăng nhập
            </Button>

            <div className="divider">
              <span>hoặc</span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="large"
              onClick={handleGoogleLogin}
              loading={googleLoading}
              disabled={googleLoading}
              className="google-button"
            >
              {!googleLoading && <img src="https://www.google.com/favicon.ico" alt="Google" />}
              Đăng nhập với Google
            </Button>

            <p className="signup-link">
              Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
