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
import logo from "@/assets/images/logo/learinal-logo.png";

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
        const role = result.user?.role;
        let next = "/dashboard";
        if (role === "Learner") next = "/home";
        else if (role === "Admin") next = "/admin";
        else if (role === "Expert") next = "/expert";
        navigate(next, { replace: true });
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-large p-6 sm:p-8">
          {/* Brand Header */}
          <header className="flex flex-col items-center mb-6 sm:mb-8">
            <img src={logo} alt="Learinal" className="h-12 sm:h-16 w-auto mb-3" />
            <div className="text-xl sm:text-2xl font-bold">
              <span className="text-primary-600 dark:text-primary-400">Lear</span>
              <span className="text-gray-800 dark:text-gray-200">inal</span>
            </div>
          </header>

          {/* Page Header */}
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Đăng nhập</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Truy cập tài khoản Learinal của bạn</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Form Options */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 dark:bg-gray-700"
                />
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Ghi nhớ đăng nhập</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-xs sm:text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="large"
              loading={loading}
              className="w-full"
            >
              Đăng nhập
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">hoặc</span>
              </div>
            </div>

            {/* Google Login */}
            <Button
              type="button"
              variant="outline"
              size="large"
              onClick={handleGoogleLogin}
              loading={googleLoading}
              disabled={googleLoading}
              className="w-full"
            >
              {!googleLoading && (
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  className="w-5 h-5 mr-2"
                />
              )}
              Đăng nhập với Google
            </Button>

            {/* Signup Link */}
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                Đăng ký ngay
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
