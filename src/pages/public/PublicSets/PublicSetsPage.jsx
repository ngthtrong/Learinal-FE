import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import questionSetsService from "@/services/api/questionSets.service";
import Button from "@/components/common/Button";
import { useToast, PremiumRequiredModal } from "@/components/common";
import { getErrorMessage } from "@/utils/errorHandler";
import { Footer } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const PublicSetsPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [questionSets, setQuestionSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("all"); // all, expert, user-shared
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    fetchPublicQuestionSets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeTab]);

  const fetchPublicQuestionSets = async () => {
    try {
      setLoading(true);
      
      const params = {
        isShared: true,
        page,
        pageSize: 12,
      };

      // Filter based on active tab
      if (activeTab === "expert") {
        params.creatorRole = "Expert";
      } else if (activeTab === "user-shared") {
        params.creatorRole = "Learner";
      }
      // For "all" tab, don't add creatorRole filter

      const response = await questionSetsService.filterSets(params);

      // Handle different response formats - filterSets returns { results, meta }
      const items = response.results || response.items || response.data || [];
      const meta = response.pagination || response.meta || {};

      setQuestionSets(items);
      setTotalPages(meta.totalPages || 1);
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1); // Reset to first page when changing tabs
  };

  const handleViewDetail = async (id, creatorRole) => {
    // If this is an expert set, check premium first
    if (creatorRole === "Expert") {
      try {
        const data = await questionSetsService.getSetById(id);
        if (data._premiumRequired) {
          // Show premium modal immediately
          setShowPremiumModal(true);
          return;
        }
      } catch (err) {
        const message = getErrorMessage(err);
        toast.showError(message);
        return;
      }
    }
    // Navigate if allowed
    navigate(`/question-sets/${id}`);
  };

  const handleStartQuiz = async (questionSetId, isExpert) => {
    // If this is an expert set, check premium first
    if (isExpert) {
      try {
        const data = await questionSetsService.getSetById(questionSetId);
        if (data._premiumRequired) {
          // Show premium modal immediately
          setShowPremiumModal(true);
          return;
        }
      } catch (err) {
        const message = getErrorMessage(err);
        toast.showError(message);
        return;
      }
    }
    navigate(`/quiz/start/${questionSetId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 rounded-lg px-4 sm:px-6 py-4 sm:py-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400"><circle cx="12" cy="12" r="10"></circle><path d="M12 2c1.5 0 2.92.69 3.82 1.97l1.38 2.16c.5.78 1.3 1.3 2.21 1.46l1.96.31c.95.15 1.73.86 2 1.8l.5 1.81c.22.8.77 1.48 1.5 1.85l1.3.66c.74.37 1.25 1.08 1.37 1.88l.25 1.65c.08.51.33.97.7 1.28l.96.82c.6.5.95 1.23.95 2 0 .77-.35 1.5-.95 2l-.96.82c-.37.31-.62.77-.7 1.28l-.25 1.65c-.12.8-.63 1.51-1.37 1.88l-1.3.66c-.73.37-1.28 1.05-1.5 1.85l-.5 1.81c-.27.94-1.05 1.65-2 1.8l-1.96.31c-.91.16-1.71.68-2.21 1.46l-1.38 2.16c-.9 1.28-2.32 1.97-3.82 1.97s-2.92-.69-3.82-1.97l-1.38-2.16c-.5-.78-1.3-1.3-2.21-1.46l-1.96-.31c-.95-.15-1.73-.86-2-1.8l-.5-1.81c-.22-.8-.77-1.48-1.5-1.85l-1.3-.66c-.74-.37-1.25-1.08-1.37-1.88l-.25-1.65c-.08-.51-.33-.97-.7-1.28l-.96-.82c-.6-.5-.95-1.23-.95-2 0-.77.35-1.5.95-2l.96-.82c.37-.31.62-.77.7-1.28l.25-1.65c.12-.8.63-1.51 1.37-1.88l1.3-.66c.73-.37 1.28-1.05 1.5-1.85l.5-1.81c.27-.94 1.05-1.65 2-1.8l1.96-.31c.91-.16 1.71-.68 2.21-1.46l1.38-2.16C9.08 2.69 10.5 2 12 2z"></path><path d="M2.5 12h19"></path></svg>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">{t("publicSets.pageTitle")}</h1>
          </div>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 ml-0 sm:ml-13">
            {t("publicSets.pageSubtitle")}
          </p>

          {/* Tabs */}
          <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
            <nav className="flex gap-2 sm:gap-4 -mb-px overflow-x-auto">
              <button
                onClick={() => handleTabChange("all")}
                className={`whitespace-nowrap pb-3 px-2 sm:px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "all"
                    ? "border-primary-600 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  {t("publicSets.tabAll")}
                </span>
              </button>
              <button
                onClick={() => handleTabChange("expert")}
                className={`whitespace-nowrap pb-3 px-2 sm:px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "expert"
                    ? "border-primary-600 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  {t("publicSets.tabExpert")}
                  <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    {t("publicSets.premium")}
                  </span>
                </span>
              </button>
              <button
                onClick={() => handleTabChange("user-shared")}
                className={`whitespace-nowrap pb-3 px-2 sm:px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "user-shared"
                    ? "border-primary-600 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                    <polyline points="16 6 12 2 8 6"></polyline>
                    <line x1="12" y1="2" x2="12" y2="15"></line>
                  </svg>
                  {t("publicSets.tabUserShared")}
                </span>
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-sm animate-pulse"
              >
                <div className="h-5 sm:h-6 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-3 sm:mb-4"></div>
                <div className="space-y-2 mb-3 sm:mb-4">
                  <div className="h-3 sm:h-4 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 dark:bg-slate-700 rounded w-2/3"></div>
                </div>
                <div className="h-9 sm:h-10 bg-gray-200 dark:bg-slate-700 rounded"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && questionSets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 sm:py-16 px-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary-100 dark:bg-primary-900/30 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600 dark:text-primary-400"><circle cx="12" cy="12" r="10"></circle><path d="M12 2c1.5 0 2.92.69 3.82 1.97l1.38 2.16c.5.78 1.3 1.3 2.21 1.46l1.96.31c.95.15 1.73.86 2 1.8l.5 1.81c.22.8.77 1.48 1.5 1.85l1.3.66c.74.37 1.25 1.08 1.37 1.88l.25 1.65c.08.51.33.97.7 1.28l.96.82c.6.5.95 1.23.95 2 0 .77-.35 1.5-.95 2l-.96.82c-.37.31-.62.77-.7 1.28l-.25 1.65c-.12.8-.63 1.51-1.37 1.88l-1.3.66c-.73.37-1.28 1.05-1.5 1.85l-.5 1.81c-.27.94-1.05 1.65-2 1.8l-1.96.31c-.91.16-1.71.68-2.21 1.46l-1.38 2.16c-.9 1.28-2.32 1.97-3.82 1.97s-2.92-.69-3.82-1.97l-1.38-2.16c-.5-.78-1.3-1.3-2.21-1.46l-1.96-.31c-.95-.15-1.73-.86-2-1.8l-.5-1.81c-.22-.8-.77-1.48-1.5-1.85l-1.3-.66c-.74-.37-1.25-1.08-1.37-1.88l-.25-1.65c-.08-.51-.33-.97-.7-1.28l-.96-.82c-.6-.5-.95-1.23-.95-2 0-.77.35-1.5.95-2l.96-.82c.37-.31.62-.77.7-1.28l.25-1.65c.12-.8.63-1.51 1.37-1.88l1.3-.66c.73-.37 1.28-1.05 1.5-1.85l.5-1.81c.27-.94 1.05-1.65 2-1.8l1.96-.31c.91-.16 1.71-.68 2.21-1.46l1.38-2.16C9.08 2.69 10.5 2 12 2z"></path><path d="M2.5 12h19"></path></svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
              {t("publicSets.noSets")}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center mb-4 sm:mb-6 max-w-md">
              {t("publicSets.noSetsDesc")}
            </p>
          </div>
        )}

        {/* Question Sets Grid */}
        {!loading && questionSets.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {questionSets.map((questionSet) => {
                const title = questionSet.title || "Bộ đề thi";
                const questionCount =
                  questionSet.questionCount ||
                  questionSet.numQuestions ||
                  questionSet.totalQuestions ||
                  0;
                const difficulty = questionSet.difficulty || "Medium";
                const createdAt = questionSet.createdAt
                  ? new Date(questionSet.createdAt).toLocaleDateString("vi-VN")
                  : "";
                const creatorName =
                  questionSet.creatorName || questionSet.creator?.name || t("publicSets.anonymous");
                const creatorRole = questionSet.creatorRole || "Learner";
                const subjectName = questionSet.subject?.name || "";
                const isExpertSet = creatorRole === "Expert";

                const difficultyColors = {
                  Easy: "bg-blue-100 text-blue-700 border-blue-200",
                  Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
                  Hard: "bg-red-100 text-red-700 border-red-200",
                };

                return (
                  <div
                    key={questionSet.id}
                    className={`group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br border shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                      isExpertSet
                        ? "from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-300 dark:border-amber-700 hover:border-amber-500 dark:hover:border-amber-500"
                        : "from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 border-gray-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500"
                    }`}
                    onClick={() => handleViewDetail(questionSet.id, creatorRole)}
                  >
                    {/* Expert Badge - Top Right */}
                    {isExpertSet && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold shadow-lg">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg>
                          Expert
                        </div>
                      </div>
                    )}

                    {/* Decorative blurred blob */}
                    <div className={`pointer-events-none absolute -top-6 -right-6 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity ${
                      isExpertSet ? "bg-amber-500/30" : "bg-primary-500/20"
                    }`} />

                    {/* Icon - Top Left */}
                    <div className="mb-4">
                      <div className={`w-14 h-14 flex items-center justify-center rounded-xl shadow-inner group-hover:scale-110 transition-transform ${
                        isExpertSet
                          ? "bg-amber-500/30 text-amber-700 dark:text-amber-400"
                          : "bg-primary-500/20 text-primary-600 dark:text-primary-400"
                      }`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="26"
                          height="26"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M2 12h20" />
                          <path d="M12 2a15.3 15.3 0 0 1 0 20" />
                          <path d="M12 2a15.3 15.3 0 0 0 0 20" />
                        </svg>
                      </div>
                    </div>

                    {/* Title and Description */}
                    <h3
                      className={`text-xl font-semibold leading-tight mb-2 transition-colors ${
                        isExpertSet
                          ? "text-gray-900 dark:text-gray-100 group-hover:text-amber-700 dark:group-hover:text-amber-400"
                          : "text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400"
                      }`}
                      title={title}
                    >
                      {title}
                    </h3>

                    {/* Creator & Subject info */}
                    <div className="text-sm text-gray-700 dark:text-gray-400 mb-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{t("publicSets.createdBy")}</span>
                        <span className="flex items-center gap-1">
                          {creatorName}
                          {isExpertSet && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-amber-600 dark:text-amber-500">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </span>
                      </div>
                      {subjectName && (
                        <div>
                          <span className="font-medium">{t("publicSets.subject")}</span> {subjectName}
                        </div>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2 items-center">
                      {questionCount > 0 && (
                        <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs font-medium rounded-full bg-primary-500/20 text-primary-700 dark:text-primary-300 border border-primary-500/30">
                          {questionCount} {t("publicSets.questions")}
                        </span>
                      )}
                      {difficulty && (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                          {difficulty === "Easy"
                            ? t("publicSets.difficultyEasy")
                            : difficulty === "Hard"
                            ? t("publicSets.difficultyHard")
                            : t("publicSets.difficultyMedium")}
                        </span>
                      )}
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30 inline-flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path><path d="M2 12h20"></path></svg>
                        {t("publicSets.public")}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(questionSet.id, creatorRole);
                        }}
                        className="w-1/2 px-3 py-2 text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-300 dark:border-slate-600 hover:border-primary-500 dark:hover:border-primary-500 transition-all shadow-sm inline-flex items-center justify-center gap-1.5"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        {t("publicSets.viewDetails")}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartQuiz(questionSet.id, isExpertSet);
                        }}
                        className={`w-1/2 px-3 py-2 text-sm font-medium text-white rounded-lg transition-all shadow-sm inline-flex items-center justify-center gap-1.5 ${
                          isExpertSet
                            ? "bg-amber-600 dark:bg-amber-700/80 hover:bg-amber-700 dark:hover:bg-amber-600"
                            : "bg-green-600 dark:bg-green-700/80 hover:bg-green-700 dark:hover:bg-green-600"
                        }`}
                      >
                        {isExpertSet ? (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                            {t("publicSets.premium")}
                          </>
                        ) : (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            {t("publicSets.tryNow")}
                          </>
                        )}
                      </button>
                    </div>

                    {/* Hover underline accent */}
                    <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary-500 group-hover:w-full transition-all" />
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
                <Button variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)} className="w-full sm:w-auto">
                  {t("publicSets.prevPage")}
                </Button>
                <div className="flex items-center gap-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                  <span className="font-medium">{t("publicSets.page")} {page}</span>
                  <span>/</span>
                  <span>{totalPages}</span>
                </div>
                <Button
                  variant="secondary"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="w-full sm:w-auto"
                >
                  {t("publicSets.nextPage")}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <Footer />
      
      {/* Premium Required Modal */}
      {showPremiumModal && (
        <PremiumRequiredModal
          onClose={() => setShowPremiumModal(false)}
          onUpgrade={() => navigate("/subscriptions/plans")}
        />
      )}
    </div>
  );
};

export default PublicSetsPage;
