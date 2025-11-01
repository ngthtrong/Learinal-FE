/**
 * Button Component
 * Reusable button component with different variants
 */

import React from "react";
import "./Button.css";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  onClick,
  className = "",
  ...props
}) => {
  const buttonClass = `btn btn-${variant} btn-${size} ${className} ${
    loading ? "btn-loading" : ""
  }`;

  return (
    <button
      type={type}
      className={buttonClass}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <span className="btn-spinner"></span>
          <span>Đang xử lý...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
