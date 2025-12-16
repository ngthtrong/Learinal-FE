/**
 * DocumentCard Component
 * Display document item with status, actions
 */

import PropTypes from "prop-types";
import Button from "@/components/common/Button";
import { formatDate } from "@/utils/formatters";
import { useLanguage } from "@/contexts/LanguageContext";

const DOCUMENT_STATUS = {
  UPLOADING: "Uploading",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  ERROR: "Error",
};

function DocumentCard({ document, onView, onDelete, onGenerateSummary }) {
  const { t } = useLanguage();
  
  const STATUS_CONFIG = {
    Uploading: { label: t("components.documentCard.statusUploading"), color: "#3b82f6", icon: "⏫" },
    Processing: { label: t("components.documentCard.statusProcessing"), color: "#f59e0b", icon: "⚙️" },
    Completed: { label: t("components.documentCard.statusCompleted"), color: "#22c55e", icon: "✓" },
    Error: { label: t("components.documentCard.statusError"), color: "#ef4444", icon: "✕" },
  };
  
  const statusConfig = STATUS_CONFIG[document.status] || STATUS_CONFIG.Completed;

  const formatFileSize = (sizeMB) => {
    if (!sizeMB && sizeMB !== 0) return "N/A";
    // Backend already returns size in MB
    return `${sizeMB} MB`;
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return "📄";
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf":
        return "📕";
      case "docx":
      case "doc":
        return "📘";
      case "txt":
        return "📝";
      default:
        return "📄";
    }
  };

  const handleCardClick = (e) => {
    if (onView && !e.target.closest("button")) {
      onView(document._id || document.id);
    }
  };

  const statusColorMap = {
    Uploading: "bg-blue-50 text-blue-600 border-blue-200",
    Processing: "bg-amber-50 text-amber-600 border-amber-200",
    Completed: "bg-green-50 text-green-600 border-green-200",
    Error: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <div
      className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Decorative blurred blob */}
      <div className="pointer-events-none absolute -top-6 -right-6 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity" />

      {/* Icon - Top Left */}
      <div className="mb-4">
        <div className="text-5xl transform group-hover:scale-110 transition-transform">
          {getFileIcon(document.originalFileName)}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {document.title || document.originalFileName}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-500 mb-3">
          {formatFileSize(document.fileSize)} •{" "}
          {formatDate(document.uploadedAt || document.createdAt)}
        </p>

        {document.summary && (
          <p className="text-sm text-gray-700 dark:text-gray-400 line-clamp-2 mb-4">
            {document.summary.substring(0, 100)}...
          </p>
        )}

        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30">
            {statusConfig.icon} {statusConfig.label}
          </span>
        </div>

        {document.status === DOCUMENT_STATUS.COMPLETED && (
          <div className="flex items-center gap-2">
            {!document.summary && onGenerateSummary && (
              <Button
                variant="outline"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onGenerateSummary();
                }}
              >
                {t("components.documentCard.generateSummary")}
              </Button>
            )}

            {onDelete && (
              <button
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                aria-label={t("components.documentCard.deleteDocument")}
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hover underline accent */}
      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary-500 group-hover:w-full transition-all" />
    </div>
  );
}

DocumentCard.propTypes = {
  document: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    originalFileName: PropTypes.string.isRequired,
    title: PropTypes.string,
    fileSize: PropTypes.number,
    status: PropTypes.string.isRequired,
    uploadedAt: PropTypes.string,
    createdAt: PropTypes.string,
    summary: PropTypes.string,
  }).isRequired,
  onView: PropTypes.func,
  onDelete: PropTypes.func,
  onGenerateSummary: PropTypes.func,
};

export default DocumentCard;
