import React from "react";
import QuizIcon from "@/components/icons/QuizIcon";
import { useNavigate } from "react-router-dom";

/**
 * QuizCard
 * Visual card for a question set (quiz) shown to users.
 * Similar to SubjectCard but for question sets/quizzes
 */
const QuizCard = ({ questionSet, onClick, onDelete, onShare, disabled }) => {
  if (!questionSet) return null;

  const navigate = useNavigate();
  const title = questionSet.title || questionSet.name || "Bộ đề thi";
  const status = questionSet.status || "Draft";
  const difficulty = questionSet.difficulty || "Medium";
  const questionCount = questionSet.questionCount || questionSet.numQuestions || 0;
  const isShared = questionSet.isShared || false;
  const createdAt = questionSet.createdAt
    ? new Date(questionSet.createdAt).toLocaleDateString("vi-VN")
    : "";

  const handleCardClick = (e) => {
    if (disabled) return;
    // Don't trigger if clicking on action buttons
    if (e.target.closest("button")) return;

    if (onClick) {
      onClick(questionSet);
    } else {
      const id = questionSet._id || questionSet.id;
      if (id) navigate(`/quiz/${id}`);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (disabled) return;
    const id = questionSet._id || questionSet.id;
    if (onShare) onShare(id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (disabled) return;
    const id = questionSet._id || questionSet.id;
    if (onDelete) onDelete(id);
  };

  const statusColors = {
    Draft: "bg-gray-100 text-gray-700 border-gray-200",
    Published: "bg-green-100 text-green-700 border-green-200",
    Archived: "bg-orange-100 text-orange-700 border-orange-200",
  };

  const difficultyColors = {
    Easy: "bg-blue-100 text-blue-700 border-blue-200",
    Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Hard: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") handleCardClick(e);
      }}
      className={`group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-white via-primary-50/40 to-secondary-50/60 border border-gray-100 hover:border-primary-300 shadow-sm hover:shadow-lg transition-all duration-300 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {/* Decorative blurred blob */}
      <div className="pointer-events-none absolute -top-6 -right-6 w-32 h-32 bg-primary-200/40 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity" />

      {/* Icon & Title */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary-100 text-primary-700 shadow-inner group-hover:scale-110 transition-transform flex-shrink-0">
          <QuizIcon size={26} strokeWidth={1.6} />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="text-lg font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors"
            title={title}
          >
            {title}
          </h3>
          {createdAt && <p className="text-xs text-gray-500 mt-1">{createdAt}</p>}
        </div>
      </div>

      {/* Badges */}
      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <span
          className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
            statusColors[status] || statusColors.Draft
          }`}
        >
          {status === "Draft" ? "Nháp" : status === "Published" ? "Công khai" : "Lưu trữ"}
        </span>
        {difficulty && (
          <span
            className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
              difficultyColors[difficulty] || difficultyColors.Medium
            }`}
          >
            {difficulty === "Easy" ? "Dễ" : difficulty === "Hard" ? "Khó" : "Trung bình"}
          </span>
        )}
        {questionCount > 0 && (
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-800/5 text-gray-700 border border-gray-200">
            {questionCount} câu hỏi
          </span>
        )}
        {isShared && (
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 border border-purple-200">
            🌐 Chia sẻ
          </span>
        )}
      </div>

      {/* Action Buttons */}
      {(onShare || onDelete) && (
        <div className="mt-4 flex gap-2">
          {onShare && (
            <button
              onClick={handleShare}
              disabled={disabled}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isShared
                  ? "text-orange-700 bg-orange-50 hover:bg-orange-100"
                  : "text-purple-700 bg-purple-50 hover:bg-purple-100"
              }`}
              title={isShared ? "Ngừng chia sẻ" : "Chia sẻ bộ đề"}
            >
              {isShared ? "🔓 Ngừng chia sẻ" : "🔗 Chia sẻ"}
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              disabled={disabled}
              className="flex-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🗑️ Xóa
            </button>
          )}
        </div>
      )}

      {/* Hover underline accent */}
      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary-500 group-hover:w-full transition-all" />
    </div>
  );
};

export default QuizCard;
