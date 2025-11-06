/**
 * DocumentCard Component
 * Display document item with status, actions
 */

import PropTypes from "prop-types";
import Button from "@/components/common/Button";
import { formatDate } from "@/utils/formatters";
import "./DocumentCard.css";

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

  return (
    <div className="document-card" onClick={handleCardClick}>
      <div className="document-icon">{getFileIcon(document.originalFileName)}</div>

      <div className="document-info">
        <h3 className="document-title">{document.title || document.originalFileName}</h3>
        <p className="document-meta">
          {formatFileSize(document.fileSize)} •{" "}
          {formatDate(document.uploadedAt || document.createdAt)}
        </p>

        {document.summary && (
          <p className="document-summary">{document.summary.substring(0, 100)}...</p>
        )}
      </div>

      <div className="document-status">
        <span
          className="status-badge"
          style={{ backgroundColor: `${statusConfig.color}20`, color: statusConfig.color }}
        >
          {statusConfig.icon} {statusConfig.label}
        </span>
      </div>

      {document.status === DOCUMENT_STATUS.COMPLETED && (
        <div className="document-actions">
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
              className="document-delete-btn"
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
