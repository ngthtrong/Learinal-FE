/**
 * Login Page
 * User login form with validation
 */

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import { Button, Input } from "@components/common";
import { oauthService } from "@services/api";
import { isValidEmail } from "@utils/validators";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
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
    setErrorMessage("");

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        navigate("/dashboard");
      } else {
        setErrorMessage(result.error || "Đăng nhập thất bại");
      }
    } catch (err) {
      setErrorMessage("Có lỗi xảy ra. Vui lòng thử lại.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorMessage("");

    try {
      const result = await oauthService.initiateGoogleLogin();

      if (!result.success) {
        setErrorMessage(result.error || "Không thể kết nối với Google");
        setGoogleLoading(false);
      }
      // If successful, user will be redirected to Google
    } catch (error) {
      console.error("Google login error:", error);
      setErrorMessage("Có lỗi xảy ra khi đăng nhập với Google");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Learinal</h1>
          <p>Đăng nhập vào tài khoản của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

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

          <div className="form-footer">
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
  );
};

export default LoginPage;
