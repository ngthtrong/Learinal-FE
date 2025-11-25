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
      className={`group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 shadow-lg hover:shadow-xl transition-all duration-300 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {/* Decorative blurred blob */}
      <div className="pointer-events-none absolute -top-6 -right-6 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity" />

      {/* Icon - Top Left */}
      <div className="mb-4">
        <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-primary-500/20 text-primary-600 dark:text-primary-400 shadow-inner group-hover:scale-110 transition-transform">
          <QuizIcon size={28} strokeWidth={1.6} />
        </div>
      </div>

      {/* Title */}
      <h3
        className="text-xl font-semibold text-gray-900 dark:text-gray-100 leading-tight mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
        title={title}
      >
        {title}
      </h3>

      {/* Created Date */}
      {createdAt && <p className="text-xs text-gray-600 dark:text-gray-500 mb-4">{createdAt}</p>}

      {/* Badges */}
      <div className="flex flex-wrap gap-2 items-center mb-4">
        {questionCount > 0 && (
          <span className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-500/20 text-primary-700 dark:text-primary-300 border border-primary-500/30">
            {questionCount} câu hỏi
          </span>
        )}
        {difficulty && (
          <span className="px-3 py-1.5 text-xs font-medium rounded-lg bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border border-yellow-500/30">
            {difficulty === "Easy" ? "Dễ" : difficulty === "Hard" ? "Khó" : "Trung Bình"}
          </span>
        )}
        {isShared && (
          <span className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30">
            🌐 Đang chia sẽ
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
                  ? "text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-500/20 hover:bg-orange-200 dark:hover:bg-orange-500/30"
                  : "text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-500/20 hover:bg-purple-200 dark:hover:bg-purple-500/30"
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
              className="flex-1 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-500/20 rounded-lg hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
