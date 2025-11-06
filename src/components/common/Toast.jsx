/**
 * Toast Component
 * Displays temporary notification messages
 */

import { useEffect } from "react";
import "./Toast.css";

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

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
      default:
        return "ℹ";
    }
  };

  return (
    <div className={`toast toast-${type}`} role="alert">
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose} aria-label="Close notification">
        ✕
      </button>
    </div>
  );
};

export default Toast;
