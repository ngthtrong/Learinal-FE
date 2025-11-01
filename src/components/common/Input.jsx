/**
 * Input Component
 * Reusable input component with label and error handling
 */

import React from "react";
import "./Input.css";

const Input = ({
  label,
  type = "text",
  name,
  value,
  placeholder,
  error,
  required = false,
  disabled = false,
  onChange,
  onBlur,
  className = "",
  ...props
}) => {
  return (
    <div className={`input-wrapper ${className}`}>
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
        className={`input-field ${error ? "input-error" : ""}`}
        {...props}
      />
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
};

export default Input;
