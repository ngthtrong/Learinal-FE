/**
 * Forgot Password Page
 * Request password reset via email
 */

import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Input, useToast } from "@components/common";
import { isValidEmail, getErrorMessage } from "@utils";
import { authService } from "@services/api";
import "./ForgotPasswordPage.css";
import logoLight from "@/assets/images/logo/learinal-logo-light.png";
import logoDark from "@/assets/images/logo/learinal-logo-dark.png";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState(null);
  const toast = useToast();

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
      setSuccess(true);
      toast.showSuccess("Đã gửi email đặt lại mật khẩu (nếu email tồn tại)");

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
          ? `Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ${retryAfter} giây.`
          : "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.";

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
    <div className="forgot-root">
      <div className="forgot-page">
        <div className="forgot-card card">
          <header className="forgot-brand">
            <img src={isDark ? logoDark : logoLight} alt="Learinal" className="brand-logo" />
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

            {rateLimitInfo && rateLimitInfo.limit && (
              <div className="rate-limit-info">
                <div className="rate-limit-message">
                  Giới hạn: {rateLimitInfo.limit} yêu cầu / 15 phút
                </div>
                {rateLimitInfo.remaining !== null && (
                  <div className="rate-limit-remaining">
                    Còn lại: <strong>{rateLimitInfo.remaining}</strong> yêu cầu
                  </div>
                )}
              </div>
            )}

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
