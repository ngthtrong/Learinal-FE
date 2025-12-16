import React from "react";
import SubjectsIcon from "@/components/icons/SubjectsIcon";
import BookIcon from "@/components/icons/BookIcon";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * SubjectCard
 * Specialized visual card for a subject shown to Learners.
 * Enhancements over generic CategoryCard:
 *  - Gradient background + subtle border + layered hover effects
 *  - Displays description (clamped) if available
 *  - Optional badges for AI-generated summary and table of contents length
 */
const SubjectCard = ({ subject, onClick }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const LEVEL_LABELS = {
    secondary: { label: t("components.subjectCard.levelSecondary"), color: 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30' },
    highschool: { label: t("components.subjectCard.levelHighschool"), color: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30' },
    university: { label: t("components.subjectCard.levelUniversity"), color: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30' },
  };

  if (!subject) return null;
  const name = subject.subjectName || subject.name || subject.title || t("components.subjectCard.defaultName");
  const description = subject.description || subject.summary || t("components.subjectCard.noDescription");
  const tocLen = Array.isArray(subject.tableOfContents) ? subject.tableOfContents.length : 0;
  const hasSummary = !!subject.summary;
  const levelInfo = subject.level ? LEVEL_LABELS[subject.level] : null;
  const documentCount =
    subject.documentCount || subject.documentsCount || subject.numDocuments || 0;
  const questionSetCount = subject.questionSetCount || subject.numQuestionSets || 0;

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
      className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      {/* Decorative blurred blob */}
      <div className="pointer-events-none absolute -top-6 -right-6 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity" />

      {/* Icon - Top Left */}
      <div className="mb-4">
        <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-primary-500/20 text-primary-600 dark:text-primary-400 shadow-inner group-hover:scale-110 transition-transform">
          <SubjectsIcon size={28} stroke={1.6} />
        </div>
      </div>

      {/* Title */}
      <h3
        className="text-xl font-semibold text-gray-900 dark:text-gray-100 leading-tight mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
        title={name}
      >
        {name}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-700 dark:text-gray-400 line-clamp-2 mb-4" title={description}>
        {description}
      </p>
      {/* Badges + stats */}
      <div className="flex flex-wrap gap-2 items-center">
        {levelInfo && (
          <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border ${levelInfo.color}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
            </svg>
            {levelInfo.label}
          </span>
        )}
        {(documentCount > 0 || questionSetCount > 0) && (
          <span className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-500/20 text-primary-700 dark:text-primary-300 border border-primary-500/30">
            {t("components.subjectCard.itemsCount", { count: documentCount })}
          </span>
        )}
        {tocLen > 0 && (
          <span className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30">
            {t("components.subjectCard.chaptersCount", { count: tocLen })}
          </span>
        )}
        {hasSummary && (
          <span className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
            AI Summary
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
