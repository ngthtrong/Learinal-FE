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
