/**
 * Reset Password Page
 * User sets a new password using token from email
 */

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button, Input, PasswordStrengthIndicator, useToast } from "@components/common";
import { useLanguage } from "@contexts/LanguageContext";
import { isValidPassword, getErrorMessage } from "@utils";
import { authService } from "@services/api";
import logo from "@/assets/images/logo/learinal-logo.png";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { t } = useLanguage();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
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

    const token = searchParams.get("token");
    if (!token) {
      const msg = t("auth.resetPasswordPage.missingToken");
      setError(msg);
      toast.showError(msg);
      return;
    }

    if (!password) {
      setError(t("auth.resetPasswordPage.passwordRequired"));
      return;
    }
    if (!isValidPassword(password)) {
      setError(t("auth.resetPasswordPage.passwordInvalid"));
      return;
    }
    if (!confirmPassword || password !== confirmPassword) {
      setError(t("auth.resetPasswordPage.confirmPasswordMismatch"));
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      toast.showSuccess(t("auth.resetPasswordPage.successToast"));
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      toast.showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-large border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
          <header className="flex flex-col items-center mb-6 sm:mb-8">
            <img src={logo} alt="Learinal" className="h-12 sm:h-16 w-auto mb-3" />
            <div className="text-xl sm:text-2xl font-bold">
              <span className="text-primary-600 dark:text-primary-400">Lear</span>
              <span className="text-gray-800 dark:text-gray-100">inal</span>
            </div>
          </header>

          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t("auth.resetPasswordPage.title")}</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{t("auth.resetPasswordPage.subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <Input
                label={t("auth.resetPasswordPage.newPasswordLabel")}
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.resetPasswordPage.passwordPlaceholder")}
                required
              />
              <PasswordStrengthIndicator password={password} />
            </div>

            <Input
              label={t("auth.resetPasswordPage.confirmPasswordLabel")}
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("auth.resetPasswordPage.passwordPlaceholder")}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="large"
              loading={loading}
              className="w-full"
            >
              {t("auth.resetPasswordPage.updateButton")}
            </Button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
              {t("auth.resetPasswordPage.backToLogin")}{" "}
              <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                {t("auth.resetPasswordPage.loginLink")}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
