/**
 * Register Page
 * User registration form
 */

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import { useLanguage } from "@contexts/LanguageContext";
import { Button, Input, PasswordStrengthIndicator, useToast } from "@components/common";
import { isValidEmail, isValidPassword, getErrorMessage } from "@utils";
import logo from "@/assets/images/logo/learinal-logo.png";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

    if (!formData.fullName) {
      newErrors.fullName = t("auth.registerPage.fullNameRequired");
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = t("auth.registerPage.fullNameMinLength");
    }

    if (!formData.email) {
      newErrors.email = t("auth.registerPage.emailRequired");
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = t("auth.registerPage.emailInvalid");
    }

    if (!formData.password) {
      newErrors.password = t("auth.registerPage.passwordRequired");
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = t("auth.registerPage.passwordInvalid");
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t("auth.registerPage.confirmPasswordRequired");
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("auth.registerPage.passwordMismatch");
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
      // eslint-disable-next-line no-unused-vars
      const { confirmPassword, ...userData } = formData;
      const result = await register(userData);

      if (result.success) {
        toast.showSuccess(t("auth.registerPage.registerSuccess"));
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        toast.showError(result.error || t("auth.registerPage.registerFailed"));
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      toast.showError(errorMsg);
      console.error("Register error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-large border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
          {/* Brand Header */}
          <header className="flex flex-col items-center mb-6 sm:mb-8">
            <img src={logo} alt="Learinal" className="h-12 sm:h-16 w-auto mb-3" />
            <div className="text-xl sm:text-2xl font-bold">
              <span className="text-primary-600 dark:text-primary-400">Lear</span>
              <span className="text-gray-800 dark:text-gray-100">inal</span>
            </div>
          </header>

          {/* Page Header */}
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t("auth.registerPage.title")}</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{t("auth.registerPage.subtitle")}</p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t("auth.registerPage.fullNameLabel")}
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              placeholder={t("auth.registerPage.fullNamePlaceholder")}
              required
            />

            <Input
              label={t("auth.registerPage.emailLabel")}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder={t("auth.registerPage.emailPlaceholder")}
              required
            />

            {/** Vai trò mặc định là Học viên (Learner). Ẩn lựa chọn vai trò trên UI. */}

            <div>
              <Input
                label={t("auth.registerPage.passwordLabel")}
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder={t("auth.registerPage.passwordPlaceholder")}
                required
              />
              <PasswordStrengthIndicator password={formData.password} />
            </div>

            <Input
              label={t("auth.registerPage.confirmPasswordLabel")}
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder={t("auth.registerPage.passwordPlaceholder")}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="large"
              loading={loading}
              className="w-full mt-6"
            >
              {t("auth.registerPage.registerButton")}
            </Button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
              {t("auth.registerPage.hasAccount")}{" "}
              <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                {t("auth.registerPage.loginNow")}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
