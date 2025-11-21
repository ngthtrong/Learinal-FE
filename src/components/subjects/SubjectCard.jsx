/**
 * Subject Card Component
 * Display subject information in a card format
 */

import { useNavigate } from "react-router-dom";
import { BookIcon } from "@components/icons";
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
    <div
      className="subject-card group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-200"
      onClick={handleClick}
    >
      <div className="subject-card-icon bg-primary-50 text-primary-600 group-hover:scale-110 transition-transform duration-300">
        <BookIcon size={32} />
      </div>

      <div className="subject-card-content">
        <h3 className="subject-card-title text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
          {subject.subjectName}
        </h3>

        {subject.description && (
          <p className="subject-card-description text-sm text-gray-500 line-clamp-2 mt-2 h-10">
            {subject.description}
          </p>
        )}

        <div className="subject-card-stats flex items-center gap-4 mt-4">
          <div className="stat-item flex items-center gap-1.5 text-sm text-gray-600">
            <span className="stat-icon">📄</span>
            <span className="stat-value font-medium">{subject.documentCount || 0}</span>
          </div>

          <div className="stat-item flex items-center gap-1.5 text-sm text-gray-600">
            <span className="stat-icon">❓</span>
            <span className="stat-value font-medium">{subject.questionSetCount || 0}</span>
          </div>
        </div>

        <div className="subject-card-footer mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="last-updated text-xs text-gray-400">
            {formatDate(subject.updatedAt || subject.createdAt)}
          </span>

          {(onEdit || onDelete) && (
            <div className="subject-card-actions flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button
                  className="action-btn edit-btn p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                  onClick={handleEdit}
                  title="Chỉnh sửa"
                  aria-label="Chỉnh sửa môn học"
                >
                  ✏️
                </button>
              )}
              {onDelete && (
                <button
                  className="action-btn delete-btn p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
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
