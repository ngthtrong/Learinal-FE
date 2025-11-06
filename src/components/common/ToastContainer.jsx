/**
 * Toast Container Component
 * Manages multiple toast notifications
 */

import { createContext, useContext, useState, useCallback } from "react";
import Toast from "./Toast";
import "./ToastContainer.css";

const ToastContext = createContext(null);

/**
 * Toast Provider Component
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = "info", duration = 5000) => {
      const id = Date.now() + Math.random();
      const newToast = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      // Auto-remove after duration if set
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (message, duration) => addToast(message, "success", duration),
    [addToast]
  );

  const showError = useCallback(
    (message, duration) => addToast(message, "error", duration),
    [addToast]
  );

  const showWarning = useCallback(
    (message, duration) => addToast(message, "warning", duration),
    [addToast]
  );

  const showInfo = useCallback(
    (message, duration) => addToast(message, "info", duration),
    [addToast]
  );

  const value = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    addToast,
    removeToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={0} // Duration handled by container
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

/**
 * Hook to access toast functions
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
