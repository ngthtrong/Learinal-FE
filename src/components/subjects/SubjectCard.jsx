import React from "react";
import BookIcon from "@/components/icons/BookIcon";
import { useNavigate } from "react-router-dom";

/**
 * SubjectCard
 * Specialized visual card for a subject shown to Learners.
 * Enhancements over generic CategoryCard:
 *  - Gradient background + subtle border + layered hover effects
 *  - Displays description (clamped) if available
 *  - Optional badges for AI-generated summary and table of contents length
 */
const SubjectCard = ({ subject, onClick }) => {
  if (!subject) return null;
  const name = subject.subjectName || subject.name || subject.title || "Môn học";
  const description = subject.description || subject.summary || "Không có mô tả";
  const tocLen = Array.isArray(subject.tableOfContents) ? subject.tableOfContents.length : 0;
  const hasSummary = !!subject.summary;
  const documentCount = subject.documentCount || subject.documentsCount || subject.numDocuments || 0;
  const questionSetCount = subject.questionSetCount || subject.numQuestionSets || 0;
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (onClick) {
      onClick(subject);
    } else {
      const id = subject._id || subject.id;
      if (id) navigate(`/subjects/${id}`);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleCardClick();
      }}
      className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-white via-primary-50/40 to-secondary-50/60 border border-gray-100 hover:border-primary-300 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      {/* Decorative blurred blob */}
      <div className="pointer-events-none absolute -top-6 -right-6 w-32 h-32 bg-primary-200/40 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity" />
      {/* Icon */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary-100 text-primary-700 shadow-inner group-hover:scale-110 transition-transform">
          <BookIcon size={26} strokeWidth={1.6} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors" title={name}>
          {name}
        </h3>
      </div>
      {/* Description */}
      <p className="mt-3 text-sm text-gray-600 line-clamp-3 group-hover:text-gray-700" title={description}>
        {description}
      </p>
      {/* Badges + stats */}
      <div className="mt-4 flex flex-wrap gap-2 items-center">
        {tocLen > 0 && (
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary-600/10 text-primary-700 border border-primary-200">
            {tocLen} mục
          </span>
        )}
        {hasSummary && (
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-secondary-600/10 text-secondary-700 border border-secondary-200">
            Tóm tắt AI
          </span>
        )}
        {(documentCount > 0 || questionSetCount > 0) && (
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-800/5 text-gray-700 border border-gray-200">
            📄 {documentCount} • ❓ {questionSetCount}
          </span>
        )}
      </div>
      {/* Actions */}
      {/* Hover underline accent */}
      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary-500 group-hover:w-full transition-all" />
    </div>
  );
};

export default SubjectCard;
