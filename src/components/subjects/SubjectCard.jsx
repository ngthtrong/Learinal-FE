/**
 * Subject Card Component
 * Display subject information in a card format
 */

import { useNavigate } from "react-router-dom";
import { BookIcon } from "@components/icons";
import "./SubjectCard.css";

/**
 * SubjectCard component
 * @param {Object} props
 * @param {Object} props.subject - Subject data
 * @param {Function} props.onDelete - Delete handler (optional)
 * @param {Function} props.onEdit - Edit handler (optional)
 */
const SubjectCard = ({ subject, onDelete, onEdit }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/subjects/${subject.id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(subject);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit?.(subject);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="subject-card" onClick={handleClick}>
      <div className="subject-card-icon">
        <BookIcon />
      </div>

      <div className="subject-card-content">
        <h3 className="subject-card-title">{subject.subjectName}</h3>

        {subject.description && <p className="subject-card-description">{subject.description}</p>}

        <div className="subject-card-stats">
          <div className="stat-item">
            <span className="stat-icon">📄</span>
            <span className="stat-value">{subject.documentCount || 0}</span>
            <span className="stat-label">tài liệu</span>
          </div>

          <div className="stat-item">
            <span className="stat-icon">❓</span>
            <span className="stat-value">{subject.questionSetCount || 0}</span>
            <span className="stat-label">câu hỏi</span>
          </div>
        </div>

        <div className="subject-card-footer">
          <span className="last-updated">
            Cập nhật: {formatDate(subject.updatedAt || subject.createdAt)}
          </span>

          {(onEdit || onDelete) && (
            <div className="subject-card-actions">
              {onEdit && (
                <button
                  className="action-btn edit-btn"
                  onClick={handleEdit}
                  title="Chỉnh sửa"
                  aria-label="Chỉnh sửa môn học"
                >
                  ✏️
                </button>
              )}
              {onDelete && (
                <button
                  className="action-btn delete-btn"
                  onClick={handleDelete}
                  title="Xóa"
                  aria-label="Xóa môn học"
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
};

export default SubjectCard;
