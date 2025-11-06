/**
 * Password Strength Indicator Component
 * Visual indicator for password strength
 */

import React from "react";
import { getPasswordStrength } from "@/utils/validators";
import "./PasswordStrengthIndicator.css";

const PasswordStrengthIndicator = ({ password }) => {
  if (!password) return null;

  const { strength, score } = getPasswordStrength(password);

  const strengthLabels = {
    weak: "Yếu",
    medium: "Trung bình",
    strong: "Mạnh",
    "very-strong": "Rất mạnh",
  };

  const strengthColors = {
    weak: "#ef4444", // red
    medium: "#f59e0b", // orange
    strong: "#3b82f6", // blue
    "very-strong": "#10b981", // green
  };

  return (
    <div className="password-strength-indicator">
      <div className="strength-bars">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={`strength-bar ${bar <= score ? "active" : ""}`}
            style={{
              backgroundColor: bar <= score ? strengthColors[strength] : "var(--border-muted)",
            }}
          />
        ))}
      </div>
      <div className="strength-label" style={{ color: strengthColors[strength] }}>
        {strengthLabels[strength]}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
