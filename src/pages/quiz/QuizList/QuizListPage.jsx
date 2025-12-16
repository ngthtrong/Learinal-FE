import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import questionSetsService from "@/services/api/questionSets.service";
import Button from "@/components/common/Button";
import { QuizCard } from "@/components/quiz";
import { useToast, Modal } from "@/components/common";
import { getErrorMessage } from "@/utils/errorHandler";
import { CreateQuizModal } from "@/components/questionSets";
import { Footer } from "@/components/layout";
import QuizIcon from "@/components/icons/QuizIcon";
import { useLanguage } from "@/contexts/LanguageContext";

function QuizListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useLanguage();
  const [questionSets, setQuestionSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("updatedAt");
  const [order, setOrder] = useState("desc");
  const [deleting, setDeleting] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null); // { id, name }
  const [unshareModal, setUnshareModal] = useState(null); // { id, name }

  useEffect(() => {
    fetchQuestionSets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortBy, order]);

  const fetchQuestionSets = async () => {
    try {
      setLoading(true);
      const response = await questionSetsService.getSets({
        page,
        pageSize: 12,
        sortBy,
        order,
      });

      // Handle different response formats
      const items = response.items || response.data || [];
      const meta = response.meta || {};

      setQuestionSets(items);
      setTotalPages(meta.totalPages || 1);
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestionSet = (id) => {
    const questionSet = questionSets.find((qs) => qs.id === id);
    if (!questionSet) return;
    setDeleteModal({ id, name: questionSet.title });
  };

  const confirmDeleteQuestionSet = async () => {
    if (!deleteModal) return;
    try {
      setDeleting(deleteModal.id);
      await questionSetsService.deleteSet(deleteModal.id);
      setQuestionSets(questionSets.filter((qs) => qs.id !== deleteModal.id));
      toast.showSuccess(t("quizPages.list.deleteSuccess"));
      setDeleteModal(null);
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
    } finally {
      setDeleting(null);
    }
  };

  const handleShareQuestionSet = async (id) => {
    const questionSet = questionSets.find((qs) => qs.id === id);
    if (!questionSet) return;

    try {
      if (questionSet.isShared) {
        // Mở modal xác nhận unshare
        setUnshareModal({ id, name: questionSet.title });
      } else {
        // Share trực tiếp
        await questionSetsService.shareSet(id);
        setQuestionSets(questionSets.map((qs) => (qs.id === id ? { ...qs, isShared: true } : qs)));
        toast.showSuccess(t("quizPages.list.shareSuccess"));
      }
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
    }
  };

  const confirmUnshareQuestionSet = async () => {
    if (!unshareModal) return;
    try {
      await questionSetsService.unshareSet(unshareModal.id);
      setQuestionSets(questionSets.map((qs) => (qs.id === unshareModal.id ? { ...qs, isShared: false } : qs)));
      toast.showSuccess(t("quizPages.list.unshareSuccess"));
      setUnshareModal(null);
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
    }
  };

  const handleGenerateQuiz = async (data) => {
    try {
      setGenerating(true);
      await questionSetsService.generateQuestionSet(data);
      toast.showSuccess(
        t("quizPages.list.generateRequest", { title: data.title })
      );
      setIsCreateModalOpen(false);
      // Refresh list
      fetchQuestionSets();
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setOrder("desc");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 rounded-lg px-4 sm:px-6 py-4 sm:py-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path><path d="M8 8h8M8 12h8"></path><path d="M16 2v20"></path></svg>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
                  {t("quizPages.list.pageTitle")}
                </h1>
              </div>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
                {t("quizPages.list.pageSubtitle")}
              </p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto">{t("quizPages.list.createNew")}</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Sort & Filter Controls */}
        {questionSets.length > 0 && !loading && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6 bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{t("quizPages.list.sortBy")}</span>
              <button
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  sortBy === "updatedAt"
                    ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
                onClick={() => handleSortChange("updatedAt")}
              >
                <span className="hidden sm:inline">{t("quizPages.list.recentlyUpdated")}</span>
                <span className="sm:hidden">{t("quizPages.list.updated")}</span>
                {sortBy === "updatedAt" && (order === "asc" ? " ↑" : " ↓")}
              </button>
              <button
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  sortBy === "title"
                    ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
                onClick={() => handleSortChange("title")}
              >
                {t("quizPages.list.nameAZ")} {sortBy === "title" && (order === "asc" ? "↑" : "↓")}
              </button>
              <button
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  sortBy === "createdAt"
                    ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
                onClick={() => handleSortChange("createdAt")}
              >
                <span className="hidden sm:inline">{t("quizPages.list.recentlyCreated")}</span>
                <span className="sm:hidden">{t("quizPages.list.created")}</span>
                {sortBy === "createdAt" && (order === "asc" ? " ↑" : " ↓")}
              </button>
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
              {t("quizPages.list.setCount", { count: questionSets.length })}
            </div>
          </div>
        )}

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
                <div className="h-8 sm:h-10 bg-gray-200 dark:bg-slate-700 rounded"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && questionSets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 sm:py-16 px-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-primary-100 dark:bg-primary-900/30 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6">
              <QuizIcon size={32} strokeWidth={2} className="sm:w-12 sm:h-12 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
              {t("quizPages.list.emptyTitle")}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center mb-4 sm:mb-6 max-w-md">
              {t("quizPages.list.emptyDescription")}
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto">{t("quizPages.list.createFirst")}</Button>
          </div>
        )}

        {/* Question Sets Grid */}
        {!loading && questionSets.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {questionSets.map((questionSet) => (
                <QuizCard
                  key={questionSet.id}
                  questionSet={questionSet}
                  onDelete={handleDeleteQuestionSet}
                  onShare={handleShareQuestionSet}
                  disabled={deleting === questionSet.id}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-6 sm:mt-8">
                <Button variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)} className="w-full sm:w-auto text-sm sm:text-base">
                  {t("quizPages.list.prevPage")}
                </Button>
                <div className="flex items-center gap-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 order-first sm:order-none">
                  <span className="font-medium">{t("quizPages.list.page", { page })}</span>
                  <span>/</span>
                  <span>{totalPages}</span>
                </div>
                <Button
                  variant="secondary"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="w-full sm:w-auto text-sm sm:text-base"
                >
                  {t("quizPages.list.nextPage")}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Quiz Modal */}
      <CreateQuizModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGenerate={handleGenerateQuiz}
        loading={generating}
      />

      {/* Delete Quiz Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title={t("quizPages.list.deleteModalTitle")}
        confirmText={t("quizPages.list.confirmDelete")}
        cancelText={t("quizPages.list.cancel")}
        onConfirm={confirmDeleteQuestionSet}
        variant="danger"
        loading={!!deleting}
      >
        <p className="text-gray-600 dark:text-gray-400">
          {t("quizPages.list.deleteConfirm", { name: deleteModal?.name })}
        </p>
      </Modal>

      {/* Unshare Quiz Modal */}
      <Modal
        isOpen={!!unshareModal}
        onClose={() => setUnshareModal(null)}
        title={t("quizPages.list.unshareModalTitle")}
        confirmText={t("quizPages.list.confirmUnshare")}
        cancelText={t("quizPages.list.cancel")}
        onConfirm={confirmUnshareQuestionSet}
        variant="danger"
      >
        <p className="text-gray-600 dark:text-gray-400">
          {t("quizPages.list.unshareConfirm", { name: unshareModal?.name })}
        </p>
      </Modal>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default QuizListPage;
