import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Input, useToast } from "@components/common";
import { useLanguage } from "@contexts/LanguageContext";
import { isValidEmail, getErrorMessage } from "@utils";
import { authService } from "@services/api";
import logo from "@/assets/images/logo/learinal-logo.png";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState(null);
  const toast = useToast();
  const { t } = useLanguage();

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
    setSuccess(false);
    setRateLimitInfo(null);

    if (!email) {
      setError(t("auth.forgotPasswordPage.emailRequired"));
      return;
    }
    if (!isValidEmail(email)) {
      setError(t("auth.forgotPasswordPage.emailInvalid"));
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSuccess(true);
      toast.showSuccess(t("auth.forgotPasswordPage.successToast"));

      // Clear rate limit info on success
      setRateLimitInfo(null);
    } catch (err) {
      // Check for rate limit error (429)
      if (err?.response?.status === 429) {
        const retryAfter = err?.response?.headers?.["retry-after"];
        const remainingRequests = err?.response?.headers?.["x-ratelimit-remaining"];
        const limit = err?.response?.headers?.["x-ratelimit-limit"];

        setRateLimitInfo({
          retryAfter: retryAfter ? parseInt(retryAfter) : null,
          remaining: remainingRequests !== undefined ? parseInt(remainingRequests) : null,
          limit: limit ? parseInt(limit) : 5,
        });

        const errorMsg = retryAfter
          ? t("auth.forgotPasswordPage.rateLimitErrorWithTime", { seconds: retryAfter })
          : t("auth.forgotPasswordPage.rateLimitError");

        setError(errorMsg);
        toast.showWarning(errorMsg);
      } else {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
        toast.showError(errorMsg);
      }
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t("auth.forgotPasswordPage.title")}</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{t("auth.forgotPasswordPage.subtitle")}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-600 dark:text-green-400">
                {t("auth.forgotPasswordPage.successMessage")}
              </div>
            )}

            {rateLimitInfo && rateLimitInfo.limit && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-2">
                <div className="text-sm text-amber-800 dark:text-amber-300">
                  {t("auth.forgotPasswordPage.rateLimitInfo", { limit: rateLimitInfo.limit })}
                </div>
                {rateLimitInfo.remaining !== null && (
                  <div className="text-sm text-amber-700 dark:text-amber-400" dangerouslySetInnerHTML={{ __html: t("auth.forgotPasswordPage.rateLimitRemaining", { remaining: rateLimitInfo.remaining }) }} />
                )}
              </div>
            )}

            <Input
              label={t("auth.forgotPasswordPage.emailLabel")}
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.forgotPasswordPage.emailPlaceholder")}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="large"
              loading={loading}
              className="w-full"
            >
              {t("auth.forgotPasswordPage.sendButton")}
            </Button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
              {t("auth.forgotPasswordPage.backToLogin")}{" "}
              <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                {t("auth.forgotPasswordPage.loginLink")}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
