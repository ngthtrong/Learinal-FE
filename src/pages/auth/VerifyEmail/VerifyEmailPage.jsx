/**
 * Verify Email Page
 * Opens from link in email: /verify-email?token=...
 * Shows success message then redirects to login.
 */

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@components/common";
import { authService } from "@services/api";
import "./VerifyEmailPage.css";
import logoLight from "@/assets/images/logo/learinal-logo-light.png";
import logoDark from "@/assets/images/logo/learinal-logo-dark.png";

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("pending"); // pending | success | error
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [email, setEmail] = useState("");

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

  // Handle verification on mount
  useEffect(() => {
    const token = searchParams.get("token");
    const emailParam = searchParams.get("email");

    if (emailParam) {
      setEmail(emailParam);
    }

    if (!token) {
      setStatus("error");
      setMessage("Thiếu token. Vui lòng mở lại liên kết trong email.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        await authService.verifyEmail(token);
        setStatus("success");
        setMessage("Xác thực email thành công. Đang chuyển đến trang đăng nhập...");
        setTimeout(() => navigate("/login", { replace: true }), 2000);
      } catch (err) {
        const msg = err?.response?.data?.message || "Không thể xác thực email. Vui lòng thử lại.";
        setStatus("error");
        setMessage(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate, searchParams]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (!email) {
      setMessage("Không tìm thấy email. Vui lòng đăng ký lại.");
      return;
    }

    setResending(true);
    try {
      await authService.resendVerification(email);
      setMessage("Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư.");
      setStatus("info");
      setResendCooldown(60); // 60 seconds cooldown
    } catch (err) {
      const msg = err?.response?.data?.message || "Không thể gửi lại email. Vui lòng thử lại.";
      setMessage(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="verify-root">
      <div className="verify-page">
        <div className="verify-card card">
          <header className="verify-brand">
            <img src={isDark ? logoDark : logoLight} alt="Learinal" className="brand-logo" />
            <div className="brand-title">
              <span className="brand-le">Lear</span>
              <span className="brand-inal">inal</span>
            </div>
          </header>

          <div className="verify-header">
            <h1>Xác thực email</h1>
            <p className="muted">Vui lòng chờ trong giây lát...</p>
          </div>

          <div className="verify-content">
            {loading && <div className="alert alert-info">Đang xử lý xác thực...</div>}
            {!loading && status === "success" && (
              <div className="alert alert-success">{message}</div>
            )}
            {!loading && status === "error" && <div className="alert alert-error">{message}</div>}
            {!loading && status === "info" && <div className="alert alert-info">{message}</div>}

            {!loading && status === "error" && email && (
              <div className="resend-section">
                <p className="resend-text">Không nhận được email?</p>
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  disabled={resending || resendCooldown > 0}
                  loading={resending}
                >
                  {resendCooldown > 0 ? `Gửi lại (${resendCooldown}s)` : "Gửi lại email xác thực"}
                </Button>
              </div>
            )}

            {!loading && status === "error" && (
              <div className="actions">
                <Button as={Link} to="/login" variant="primary">
                  Về trang đăng nhập
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
