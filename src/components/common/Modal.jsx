/**
 * Modal Component
 * Reusable modal dialog with overlay using Tailwind CSS
 */

import React, { useEffect } from "react";
import { Button } from "@/components/common";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onConfirm,
  variant = "default", // default | danger | warning
  size = "medium", // small | medium | large
  loading = false,
  showCloseButton = true, // New prop to control close button visibility
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Size styles
  const sizeStyles = {
    small: "max-w-md",
    medium: "max-w-lg",
    large: "max-w-2xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div
        className={`
        relative w-full ${sizeStyles[size] || sizeStyles.medium}
        bg-white rounded-2xl shadow-large
        animate-slide-up
        max-h-[90vh] flex flex-col
      `}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            {showCloseButton && (
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                onClick={onClose}
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>

        {onConfirm && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              {cancelText}
            </Button>
            <Button
              variant={variant === "danger" ? "danger" : "primary"}
              onClick={onConfirm}
              loading={loading}
            >
              {confirmText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
