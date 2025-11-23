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
import { formatDate } from "@/utils/formatters";
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
      const active = items.find(r => r.status !== 'Completed');
      const completed = items
        .filter(r => r.status === 'Completed')
        .sort((a,b)=> new Date(b.completionTime||b.updatedAt||b.createdAt) - new Date(a.completionTime||a.updatedAt||a.createdAt))[0];
      if (active) { setCurrentReview(active); setReviewRequested(true); }
      if (completed) { setCompletedReview(completed); }
    } catch (e) { /* ignore */ }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!questionSet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-900">Không tìm thấy bộ câu hỏi</h2>
          <p className="text-gray-600">Bộ câu hỏi này có thể đã bị xóa hoặc không tồn tại</p>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            ← Quay lại
          </Button>
          <Button onClick={handleStartQuiz} variant="primary" size="large">
            🎯 Bắt đầu làm bài
          </Button>
        </div>

        {/* Question Set Info */}
        <div className="bg-white rounded-xl shadow-medium p-8 mb-8">
          <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
            <h1 className="text-3xl font-bold text-gray-900 flex-1">{questionSet.title}</h1>
            <div className="flex items-center gap-2 ml-4 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  questionSet.status === "Draft"
                    ? "bg-gray-100 text-gray-700"
                    : questionSet.status === "Processing"
                    ? "bg-warning-100 text-warning-700"
                    : questionSet.status === "Published"
                    ? "bg-success-100 text-success-700"
                    : questionSet.status === "Public"
                    ? "bg-primary-100 text-primary-700"
                    : "bg-gray-100 text-gray-700"
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
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-secondary-100 text-secondary-700">
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
                    currentReview.status === 'PendingAssignment'
                      ? 'bg-indigo-100 text-indigo-700'
                      : currentReview.status === 'Assigned'
                      ? 'bg-primary-100 text-primary-700'
                      : currentReview.status === 'Completed'
                      ? 'bg-success-100 text-success-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {currentReview.status === 'PendingAssignment' && '⏳ Chờ gán chuyên gia'}
                  {currentReview.status === 'Assigned' && '👨‍🏫 Đã gán chuyên gia'}
                  {currentReview.status === 'Completed' && '✅ Đã hoàn tất'}
                  {!['PendingAssignment','Assigned','Completed'].includes(currentReview.status) && currentReview.status}
                </span>
              )}
              {!reviewRequested && completedReview && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-success-100 text-success-700">
                  ✅ Đã kiểm duyệt
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="flex items-center gap-4 bg-primary-50 rounded-lg p-4">
              <div className="text-3xl">📊</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {questionSet.questionCount || 0}
                </div>
                <div className="text-sm text-gray-600">Câu hỏi</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-secondary-50 rounded-lg p-4">
              <div className="text-3xl">🎯</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{attempts.length}</div>
                <div className="text-sm text-gray-600">Lượt làm</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-success-50 rounded-lg p-4">
              <div className="text-3xl">⭐</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{bestScore.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Điểm cao nhất</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-warning-50 rounded-lg p-4">
              <div className="text-3xl">📈</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{avgScore.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Điểm trung bình</div>
              </div>
            </div>
          </div>

          {questionSet.description && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📝 Mô tả</h3>
              <p className="text-gray-700 leading-relaxed">{questionSet.description}</p>
            </div>
          )}

          <div className="flex flex-col gap-2 text-sm text-gray-600 border-t border-gray-200 pt-4">
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
              <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-green-700 flex items-center gap-2">
                    <span>👨‍🏫</span> Chuyên gia: {completedReview.expertName || completedReview.expertId || '—'}
                  </div>
                  <div className="text-xs text-green-700">
                    Hoàn thành: {formatDate(completedReview.completionTime || completedReview.updatedAt)}
                  </div>
                </div>
                <div className="text-sm mb-2">
                  <span className="font-medium">Kết quả: </span>
                  {completedReview.decision === 'Approved' && '✅ Phê duyệt'}
                  {completedReview.decision === 'Rejected' && '❌ Từ chối'}
                  {!completedReview.decision && '—'}
                </div>
                {completedReview.feedback && (
                  <div className="text-sm whitespace-pre-line">
                    <span className="font-medium">Nhận xét:</span> {completedReview.feedback}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quiz Attempts History */}
        <div className="bg-white rounded-xl shadow-medium overflow-hidden">
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">📚 Lịch sử làm bài</h2>
            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {completedAttempts.length}/{attempts.length} hoàn thành
            </span>
          </div>

          {loadingAttempts ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-3"></div>
              <p className="text-gray-600">Đang tải lịch sử...</p>
            </div>
          ) : attempts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lần
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Điểm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bắt đầu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hoàn thành
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attempts.map((attempt, index) => {
                    const duration = attempt.completedAt
                      ? Math.floor(
                          (new Date(attempt.completedAt) - new Date(attempt.startedAt)) / 1000 / 60
                        )
                      : null;
                    return (
                      <tr
                        key={attempt.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          attempt.isCompleted ? "" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{attempts.length - index}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              attempt.isCompleted
                                ? "bg-success-100 text-success-800"
                                : "bg-warning-100 text-warning-800"
                            }`}
                          >
                            {attempt.isCompleted ? "✅ Hoàn thành" : "⏳ Đang làm"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {attempt.isCompleted ? (
                            <span className="text-lg font-bold text-primary-600">
                              {attempt.score?.toFixed(1) || 0}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(attempt.startedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {attempt.completedAt ? (
                            formatDate(attempt.completedAt)
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {duration !== null ? (
                            `${duration} phút`
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {attempt.isCompleted && (
                            <Button
                              variant="secondary"
                              size="small"
                              onClick={() => handleViewAttempt(attempt.id)}
                            >
                              👁️ Xem
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
              <p className="text-gray-600 mb-6">
                Chưa có lượt làm bài nào. Hãy bắt đầu làm bài đầu tiên!
              </p>
              <Button onClick={handleStartQuiz}>🎯 Bắt đầu làm bài</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestionSetDetailPage;
