/**
 * Public Sets Page
 * Display publicly shared question sets
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import questionSetsService from "@/services/api/questionSets.service";
import Button from "@/components/common/Button";
import { useToast } from "@/components/common";
import { getErrorMessage } from "@/utils/errorHandler";

const PublicSetsPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [questionSets, setQuestionSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPublicQuestionSets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchPublicQuestionSets = async () => {
    try {
      setLoading(true);
      const response = await questionSetsService.filterSets({
        isShared: true,
        page,
        pageSize: 12,
      });

      // Handle different response formats - filterSets returns { results, meta }
      const items = response.results || response.items || response.data || [];
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

  const handleViewDetail = (id) => {
    navigate(`/question-sets/${id}`);
  };

  const handleStartQuiz = (id) => {
    navigate(`/quiz/start/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:to-gray-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg px-6 py-6 mb-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">🌍 Bộ Đề Chung</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Khám phá và làm thử các bộ đề thi được chia sẻ công khai từ cộng đồng
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm animate-pulse"
              >
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && questionSets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">🌍</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Chưa có bộ đề công khai nào
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
              Hiện tại chưa có bộ đề nào được chia sẻ công khai. Hãy quay lại sau!
            </p>
          </div>
        )}

        {/* Question Sets Grid */}
        {!loading && questionSets.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  questionSet.creatorName || questionSet.creator?.name || "Ẩn danh";
                const subjectName = questionSet.subject?.name || "";

                const difficultyColors = {
                  Easy: "bg-blue-100 text-blue-700 border-blue-200",
                  Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
                  Hard: "bg-red-100 text-red-700 border-red-200",
                };

                return (
                  <div
                    key={questionSet.id}
                    className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => handleViewDetail(questionSet.id)}
                  >
                    {/* Decorative blurred blob */}
                    <div className="pointer-events-none absolute -top-6 -right-6 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity" />

                    {/* Icon - Top Left */}
                    <div className="mb-4">
                      <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-primary-500/20 text-primary-600 dark:text-primary-400 shadow-inner group-hover:scale-110 transition-transform">
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
                      className="text-xl font-semibold text-gray-900 dark:text-gray-100 leading-tight mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
                      title={title}
                    >
                      {title}
                    </h3>

                    {/* Creator & Subject info */}
                    <div className="text-sm text-gray-700 dark:text-gray-400 mb-3 space-y-1">
                      <div>
                        <span className="font-medium">Tạo bởi:</span> {creatorName}
                      </div>
                      {subjectName && (
                        <div>
                          <span className="font-medium">Môn học:</span> {subjectName}
                        </div>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="mt-4 flex flex-wrap gap-2 items-center">
                      {questionCount > 0 && (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary-500/20 text-primary-700 dark:text-primary-300 border border-primary-500/30">
                          {questionCount} câu hỏi
                        </span>
                      )}
                      {difficulty && (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                          {difficulty === "Easy"
                            ? "Dễ"
                            : difficulty === "Hard"
                            ? "Khó"
                            : "Trung bình"}
                        </span>
                      )}
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30">
                        🌐 Chung
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(questionSet.id);
                        }}
                        className="w-1/2 px-3 py-2 text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 transition-all shadow-sm"
                      >
                        👁️ Xem chi tiết
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartQuiz(questionSet.id);
                        }}
                        className="w-1/2 px-3 py-2 text-sm font-medium text-white dark:text-white bg-green-600 dark:bg-green-700/80 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-all shadow-sm"
                      >
                        ▶️ Làm thử
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
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>
                  ← Trang trước
                </Button>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="font-medium">Trang {page}</span>
                  <span>/</span>
                  <span>{totalPages}</span>
                </div>
                <Button
                  variant="secondary"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Trang sau →
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            © 2025 Learinal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicSetsPage;
