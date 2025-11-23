/**
 * DocumentCard Component
 * Display document item with status, actions
 */

import PropTypes from "prop-types";
import Button from "@/components/common/Button";
import { formatDate } from "@/utils/formatters";

const DOCUMENT_STATUS = {
  UPLOADING: "Uploading",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  ERROR: "Error",
};

const STATUS_CONFIG = {
  Uploading: { label: "Đang tải lên...", color: "#3b82f6", icon: "⏫" },
  Processing: { label: "Đang xử lý...", color: "#f59e0b", icon: "⚙️" },
  Completed: { label: "Hoàn tất", color: "#22c55e", icon: "✓" },
  Error: { label: "Lỗi", color: "#ef4444", icon: "✕" },
};

function DocumentCard({ document, onView, onDelete, onGenerateSummary }) {
  const statusConfig = STATUS_CONFIG[document.status] || STATUS_CONFIG.Completed;

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
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
      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-medium transition-all cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">{getFileIcon(document.originalFileName)}</div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
            {document.title || document.originalFileName}
          </h3>
          <p className="text-sm text-gray-500 mb-2">
            {formatFileSize(document.fileSize)} •{" "}
            {formatDate(document.uploadedAt || document.createdAt)}
          </p>

          {document.summary && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {document.summary.substring(0, 100)}...
            </p>
          )}

          <div className="mb-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                statusColorMap[document.status] || statusColorMap.Completed
              }`}
            >
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
                  🤖 Tạo tóm tắt
                </Button>
              )}

              {onDelete && (
                <button
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  aria-label="Xóa tài liệu"
                >
                  🗑️
                </button>
              )}
            </div>
          )}
        </div>
      </div>
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
