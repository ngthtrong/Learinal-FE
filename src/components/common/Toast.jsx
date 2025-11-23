/**
 * Toast Component
 * Displays temporary notification messages using Tailwind CSS
 */

import { useEffect } from "react";

/**
 * Toast notification component
 * @param {Object} props
 * @param {string} props.message - The message to display
 * @param {('success'|'error'|'warning'|'info')} props.type - Toast type
 * @param {number} props.duration - Auto-dismiss duration in ms (default: 5000)
 * @param {Function} props.onClose - Callback when toast is closed
 */
const Toast = ({ message, type = "info", duration = 5000, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    success: {
      bg: "bg-success-50 border-success-500",
      icon: "bg-success-500 text-white",
      text: "text-success-800",
      iconSymbol: "✓",
    },
    error: {
      bg: "bg-error-50 border-error-500",
      icon: "bg-error-500 text-white",
      text: "text-error-800",
      iconSymbol: "✕",
    },
    warning: {
      bg: "bg-warning-50 border-warning-500",
      icon: "bg-warning-500 text-white",
      text: "text-warning-800",
      iconSymbol: "⚠",
    },
    info: {
      bg: "bg-primary-50 border-primary-500",
      icon: "bg-primary-500 text-white",
      text: "text-primary-800",
      iconSymbol: "ℹ",
    },
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div
      className={`
        flex items-center gap-3 p-4 rounded-lg border-l-4 shadow-medium
        ${style.bg}
        animate-slide-in
        min-w-[320px] max-w-md
      `}
      role="alert"
    >
      <div
        className={`
        flex items-center justify-center
        w-8 h-8 rounded-full shrink-0
        ${style.icon}
        font-bold text-lg
      `}
      >
        {style.iconSymbol}
      </div>
      <div className={`flex-1 ${style.text} text-sm font-medium`}>{message}</div>
      <button
        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-white/50"
        onClick={onClose}
        aria-label="Close notification"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
