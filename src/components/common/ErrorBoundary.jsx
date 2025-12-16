/**
 * Error Boundary Component
 * Catches and handles React component errors using Tailwind CSS
 */

import { Component, useContext } from "react";
import LanguageContext from "@/contexts/LanguageContext";

// Fallback translations when LanguageContext is not available
const fallbackTranslations = {
  "components.errorBoundary.title": "Oops! Có lỗi xảy ra",
  "components.errorBoundary.message": "Ứng dụng gặp lỗi không mong muốn. Vui lòng thử lại.",
  "components.errorBoundary.detailsTitle": "Chi tiết lỗi (Development only)",
  "components.errorBoundary.retryButton": "Thử lại",
  "components.errorBoundary.homeButton": "Về trang chủ",
};

// Inner class component
class ErrorBoundaryClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError() {
    // Update state so next render shows fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error("Error Boundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // You can also log to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { t } = this.props;

    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-large p-8 max-w-lg w-full text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t("components.errorBoundary.title")}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t("components.errorBoundary.message")}
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="text-left mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                  {t("components.errorBoundary.detailsTitle")}
                </summary>
                <pre className="mt-3 text-xs text-red-600 dark:text-red-400 overflow-auto max-h-48 p-3 bg-white dark:bg-gray-800 rounded border border-red-200 dark:border-red-800">
                  {this.state.error.toString()}
                  {"\n"}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm"
                onClick={this.handleReset}
              >
                {t("components.errorBoundary.retryButton")}
              </button>
              <button
                className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                onClick={() => (window.location.href = "/")}
              >
                {t("components.errorBoundary.homeButton")}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper to provide translation function with fallback
const ErrorBoundary = ({ children }) => {
  const context = useContext(LanguageContext);
  
  // Use context's t function if available, otherwise use fallback
  const t = context?.t || ((key) => fallbackTranslations[key] || key);
  
  return <ErrorBoundaryClass t={t}>{children}</ErrorBoundaryClass>;
};

export default ErrorBoundary;
