/**
 * Verify Email Page
 * Opens from link in email: /verify-email?token=...
 * Shows success message then redirects to login.
 */

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@components/common";
import { authService } from "@services/api";
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-large p-8 border border-transparent dark:border-gray-700">
          <header className="flex flex-col items-center mb-8">
            <img src={isDark ? logoDark : logoLight} alt="Learinal" className="h-16 w-auto mb-3" />
            <div className="text-2xl font-bold">
              <span className="text-primary-600 dark:text-primary-400">Lear</span>
              <span className="text-gray-800 dark:text-gray-100">inal</span>
            </div>
          </header>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Xác thực email</h1>
            <p className="text-gray-600 dark:text-gray-400">Vui lòng chờ trong giây lát...</p>
          </div>

          <div className="space-y-4">
            {loading && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center text-blue-700 dark:text-blue-400">
                Đang xử lý xác thực...
              </div>
            )}

            {!loading && status === "success" && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center text-green-700 dark:text-green-400">
                {message}
              </div>
            )}

            {!loading && status === "error" && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center text-red-600 dark:text-red-400">
                {message}
              </div>
            )}

            {!loading && status === "info" && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center text-blue-700 dark:text-blue-400">
                {message}
              </div>
            )}

            {!loading && status === "error" && email && (
              <div className="text-center space-y-3 pt-4">
                <p className="text-gray-600 dark:text-gray-400">Không nhận được email?</p>
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  disabled={resending || resendCooldown > 0}
                  loading={resending}
                  className="w-full"
                >
                  {resendCooldown > 0 ? `Gửi lại (${resendCooldown}s)` : "Gửi lại email xác thực"}
                </Button>
              </div>
            )}

            {!loading && status === "error" && (
              <div className="pt-4">
                <Button as={Link} to="/login" variant="primary" className="w-full">
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
