/**
 * Modal Component
 * Reusable modal dialog with overlay using Tailwind CSS
 */

import React, { useEffect } from "react";
import { Button } from "@/components/common";
import { useLanguage } from "@/contexts/LanguageContext";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  confirmText,
  cancelText,
  onConfirm,
  variant = "default", // default | danger | warning
  size = "medium", // small | medium | large
  loading = false,
  showCloseButton = true, // New prop to control close button visibility
}) => {
  const { t } = useLanguage();

  // Use translations as defaults if not provided
  const resolvedConfirmText = confirmText ?? t("components.modal.confirm");
  const resolvedCancelText = cancelText ?? t("components.modal.cancel");

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
        bg-white dark:bg-gray-800 rounded-2xl shadow-large
        animate-slide-up
        max-h-[90vh] flex flex-col
      `}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            {showCloseButton && (
              <button
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={onClose}
                aria-label={t("components.modal.close")}
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
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-2xl">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              {resolvedCancelText}
            </Button>
            <Button
              variant={variant === "danger" ? "danger" : "primary"}
              onClick={onConfirm}
              loading={loading}
            >
              {resolvedConfirmText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
