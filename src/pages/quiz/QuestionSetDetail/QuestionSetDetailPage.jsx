/**
 * Question Set Detail Page
 * View question set details and manage quiz attempts history
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import questionSetsService from "@/services/api/questionSets.service";
import quizAttemptsService from "@/services/api/quizAttempts.service";
import Button from "@/components/common/Button";
import { useToast } from "@/components/common";
import { getErrorMessage } from "@/utils/errorHandler";
import { formatDate, formatTime } from "@/utils/formatters";
import { useAuth } from "@/contexts/AuthContext";
import { validationRequestsService } from "@/services/api";
function QuestionSetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [questionSet, setQuestionSet] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const { user } = useAuth();
  const [requestingReview, setRequestingReview] = useState(false);
  const [reviewRequested, setReviewRequested] = useState(false);
  const [currentReview, setCurrentReview] = useState(null); // active or last review
  const [completedReview, setCompletedReview] = useState(null); // latest completed review

  useEffect(() => {
    fetchQuestionSet();
    fetchAttempts();
    fetchValidationRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  const fetchValidationRequest = async () => {
    try {
      const data = await validationRequestsService.list({ page: 1, pageSize: 20, setId: id });
      const items = data?.items || data?.data || [];
      if (!items.length) return;
      const active = items.find((r) => r.status !== "Completed");
      const completed = items
        .filter((r) => r.status === "Completed")
        .sort(
          (a, b) =>
            new Date(b.completionTime || b.updatedAt || b.createdAt) -
            new Date(a.completionTime || a.updatedAt || a.createdAt)
        )[0];
      if (active) {
        setCurrentReview(active);
        setReviewRequested(true);
      }
      if (completed) {
        setCompletedReview(completed);
      }
    } catch (e) {
      /* ignore */
    }
  };

  const fetchQuestionSet = async () => {
    try {
      setLoading(true);
      const data = await questionSetsService.getSetById(id);
      setQuestionSet(data);
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
      setTimeout(() => navigate("/question-sets"), 2000);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttempts = async () => {
    try {
      setLoadingAttempts(true);
      const response = await quizAttemptsService.getAttemptsByQuestionSet(id);
      const attemptsData = response.data || response || [];
      setAttempts(Array.isArray(attemptsData) ? attemptsData : []);
    } catch (err) {
      console.error("Failed to fetch attempts:", err);
      setAttempts([]);
    } finally {
      setLoadingAttempts(false);
    }
  };

  const handleStartQuiz = () => {
    navigate(`/quiz/start/${id}`);
  };

  const handleViewAttempt = (attemptId) => {
    navigate(`/quiz/result/${attemptId}`);
  };

  const handleContinueAttempt = (attemptId) => {
    navigate(`/quiz/take/${attemptId}`);
  };

  const canRequestReview = () => {
    if (!questionSet || !user) return false;
    const isOwner = String(questionSet.userId || questionSet.user?.id) === String(user.id);
    const blockedStatuses = ["Validated", "Public"];
    return isOwner && !reviewRequested && !blockedStatuses.includes(questionSet.status);
  };

  const handleRequestReview = async () => {
    if (!canRequestReview()) return;
    setRequestingReview(true);
    try {
      const res = await questionSetsService.requestReview(id);
      toast.showSuccess(res?.message || "Đã gửi yêu cầu kiểm duyệt");
      // refresh validation request list to capture real status (PendingAssignment)
      await fetchValidationRequest();
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.showError(msg);
      if (err?.response?.status === 409) {
        await fetchValidationRequest();
      }
    } finally {
      setRequestingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block w-12 h-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!questionSet) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Không tìm thấy bộ câu hỏi</h2>
          <p className="text-gray-600 dark:text-gray-400">Bộ câu hỏi này có thể đã bị xóa hoặc không tồn tại</p>
          <Button onClick={() => navigate(-1)}>← Quay lại</Button>
        </div>
      </div>
    );
  }

  const completedAttempts = attempts.filter((a) => a.isCompleted);
  const avgScore =
    completedAttempts.length > 0
      ? completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length
      : 0;
  const bestScore =
    completedAttempts.length > 0 ? Math.max(...completedAttempts.map((a) => a.score || 0)) : 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg px-6 py-6 mb-6">
          <div className="flex items-center justify-between">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              ← Quay lại
            </Button>
            <Button onClick={handleStartQuiz} variant="primary" size="large">
              🎯 Bắt đầu làm bài
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Question Set Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex-1">
              {questionSet.title}
            </h1>
            <div className="flex items-center gap-2 ml-4 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  questionSet.status === "Draft"
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    : questionSet.status === "Processing"
                    ? "bg-warning-100 dark:bg-yellow-900/30 text-warning-700 dark:text-yellow-300"
                    : questionSet.status === "Published"
                    ? "bg-success-100 dark:bg-green-900/30 text-success-700 dark:text-green-300"
                    : questionSet.status === "Public"
                    ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                {questionSet.status === "Draft"
                  ? "📝 Nháp"
                  : questionSet.status === "Processing"
                  ? "⚙️ Đang xử lý"
                  : questionSet.status === "Published"
                  ? "✅ Đã xuất bản"
                  : questionSet.status === "Public"
                  ? "🌐 Công khai"
                  : questionSet.status}
              </span>
              {questionSet.isShared && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300">
                  🔗 Đã chia sẻ
                </span>
              )}
              {canRequestReview() && (
                <Button
                  variant="outline"
                  size="small"
                  disabled={requestingReview}
                  onClick={handleRequestReview}
                >
                  {requestingReview ? "Đang gửi..." : "Gửi yêu cầu chuyên gia duyệt"}
                </Button>
              )}
              {reviewRequested && currentReview && (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentReview.status === "PendingAssignment"
                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                      : currentReview.status === "Assigned"
                      ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                      : currentReview.status === "Completed"
                      ? "bg-success-100 dark:bg-green-900/30 text-success-700 dark:text-green-300"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {currentReview.status === "PendingAssignment" && "⏳ Chờ gán chuyên gia"}
                  {currentReview.status === "Assigned" && "👨‍🏫 Đã gán chuyên gia"}
                  {currentReview.status === "Completed" && "✅ Đã hoàn tất"}
                  {!["PendingAssignment", "Assigned", "Completed"].includes(currentReview.status) &&
                    currentReview.status}
                </span>
              )}
              {!reviewRequested && completedReview && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-success-100 dark:bg-green-900/30 text-success-700 dark:text-green-300">
                  ✅ Đã kiểm duyệt
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="flex items-center gap-4 bg-primary-50 dark:bg-primary-900/30 rounded-lg p-4">
              <div className="text-3xl">📊</div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {questionSet.questionCount || questionSet.questions?.length || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Câu hỏi</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-secondary-50 dark:bg-secondary-900/30 rounded-lg p-4">
              <div className="text-3xl">🎯</div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {attempts.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Lượt làm</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-success-50 dark:bg-success-900/30 rounded-lg p-4">
              <div className="text-3xl">⭐</div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {bestScore.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Điểm cao nhất</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-warning-50 dark:bg-warning-900/30 rounded-lg p-4">
              <div className="text-3xl">📈</div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {avgScore.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Điểm trung bình</div>
              </div>
            </div>
          </div>

          {questionSet.description && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                📝 Mô tả
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {questionSet.description}
              </p>
            </div>
          )}

          {questionSet.isShared && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                🔗 Link chia sẻ
              </h3>
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/question-sets/${questionSet.id}`}
                  className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onClick={(e) => e.target.select()}
                />
                <Button
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/question-sets/${questionSet.id}`
                    );
                    toast.showSuccess("Đã sao chép link!");
                  }}
                >
                  📋 Sao chép
                </Button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                💡 Chia sẻ link này để người khác có thể xem và làm bài tập
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
            <span className="flex items-center gap-2">
              <span>📅</span>
              Tạo: {formatDate(questionSet.createdAt)}
            </span>
            {questionSet.updatedAt !== questionSet.createdAt && (
              <span className="flex items-center gap-2">
                <span>🔄</span>
                Cập nhật: {formatDate(questionSet.updatedAt)}
              </span>
            )}
            {completedReview && (
              <div className="mt-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
                    <span>👨‍🏫</span> Chuyên gia:{" "}
                    {completedReview.expertName || completedReview.expertId || "—"}
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-400">
                    Hoàn thành:{" "}
                    {formatDate(completedReview.completionTime || completedReview.updatedAt)}
                  </div>
                </div>
                <div className="text-sm mb-2 text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Kết quả: </span>
                  {completedReview.decision === "Approved" && "✅ Phê duyệt"}
                  {completedReview.decision === "Rejected" && "❌ Từ chối"}
                  {!completedReview.decision && "—"}
                </div>
                {completedReview.feedback && (
                  <div className="text-sm whitespace-pre-line text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Nhận xét:</span> {completedReview.feedback}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quiz Attempts History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-medium border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              📚 Lịch sử làm bài
            </h2>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              {completedAttempts.length}/{attempts.length} hoàn thành
            </span>
          </div>

          {loadingAttempts ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin mb-3"></div>
              <p className="text-gray-600 dark:text-gray-400">Đang tải lịch sử...</p>
            </div>
          ) : attempts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Lần
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Điểm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Bắt đầu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Hoàn thành
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {attempts.map((attempt, index) => {
                    const duration = attempt.completedAt
                      ? Math.floor(
                          (new Date(attempt.completedAt) - new Date(attempt.startedAt)) / 1000 / 60
                        )
                      : null;
                    return (
                      <tr
                        key={attempt.id}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                          attempt.isCompleted ? "" : "bg-gray-50 dark:bg-gray-900/50"
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          #{attempts.length - index}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              attempt.isCompleted
                                ? "bg-success-100 dark:bg-green-900/30 text-success-800 dark:text-green-300"
                                : "bg-warning-100 dark:bg-yellow-900/30 text-warning-800 dark:text-yellow-300"
                            }`}
                          >
                            {attempt.isCompleted ? "✅ Hoàn thành" : "⏳ Đang làm"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {attempt.isCompleted ? (
                            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                              {attempt.score?.toFixed(1) || 0}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {formatTime(attempt.startedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {attempt.completedAt ? (
                            formatTime(attempt.completedAt)
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {duration !== null ? (
                            `${duration} phút`
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {attempt.isCompleted ? (
                            <Button
                              variant="primary"
                              size="small"
                              onClick={() => handleViewAttempt(attempt.id)}
                              className="flex items-center gap-2"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              Xem kết quả
                            </Button>
                          ) : (
                            <Button
                              variant="success"
                              size="small"
                              onClick={() => handleContinueAttempt(attempt.id)}
                              className="flex items-center gap-2"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                />
                              </svg>
                              Tiếp tục làm
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Chưa có lượt làm bài nào. Hãy bắt đầu làm bài đầu tiên!
              </p>
              <Button onClick={handleStartQuiz}>🎯 Bắt đầu làm bài</Button>
            </div>
          )}
        </div>
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
}

export default QuestionSetDetailPage;
