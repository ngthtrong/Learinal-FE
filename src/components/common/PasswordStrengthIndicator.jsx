/**
 * Password Strength Indicator Component
 * Visual indicator for password strength
 */

import React from "react";
import { getPasswordStrength } from "@/utils/validators";

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
    weak: "bg-red-500",
    medium: "bg-amber-500",
    strong: "bg-blue-500",
    "very-strong": "bg-green-500",
  };

  const strengthTextColors = {
    weak: "text-red-500",
    medium: "text-amber-500",
    strong: "text-blue-500",
    "very-strong": "text-green-500",
  };

  return (
    <div className="mt-3">
      <div className="flex gap-2 mb-2">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              bar <= score ? strengthColors[strength] : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <div className={`text-sm font-medium ${strengthTextColors[strength]}`}>
        {strengthLabels[strength]}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
