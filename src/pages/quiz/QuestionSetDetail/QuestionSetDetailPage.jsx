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
import "./QuestionSetDetailPage.css";

function QuestionSetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [questionSet, setQuestionSet] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  useEffect(() => {
    fetchQuestionSet();
    fetchAttempts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  if (loading) {
    return (
      <div className="question-set-detail-page">
        <div className="detail-skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-body">
            <div className="skeleton-line"></div>
            <div className="skeleton-line" style={{ width: "80%" }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!questionSet) {
    return (
      <div className="question-set-detail-page">
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h2>Không tìm thấy bộ câu hỏi</h2>
          <p>Bộ câu hỏi này có thể đã bị xóa hoặc không tồn tại</p>
          <Button onClick={() => navigate("/question-sets")}>← Quay lại danh sách</Button>
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
    <div className="question-set-detail-page">
      {/* Header */}
      <div className="page-header">
        <Button variant="secondary" onClick={() => navigate("/question-sets")}>
          ← Quay lại
        </Button>
        <div className="header-actions">
          <Button onClick={handleStartQuiz} variant="primary" size="large">
            🎯 Bắt đầu làm bài
          </Button>
        </div>
      </div>

      {/* Question Set Info */}
      <div className="question-set-info-card">
        <div className="question-set-header">
          <h1>{questionSet.title}</h1>
          <div className="question-set-badges">
            <span className={`badge badge-status status-${questionSet.status?.toLowerCase()}`}>
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
            {questionSet.isShared && <span className="badge badge-shared">🔗 Đã chia sẻ</span>}
          </div>
        </div>

        <div className="question-set-stats">
          <div className="stat-item">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{questionSet.questionCount || 0}</div>
              <div className="stat-label">Câu hỏi</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-value">{attempts.length}</div>
              <div className="stat-label">Lượt làm</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <div className="stat-value">{bestScore.toFixed(1)}</div>
              <div className="stat-label">Điểm cao nhất</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className="stat-value">{avgScore.toFixed(1)}</div>
              <div className="stat-label">Điểm trung bình</div>
            </div>
          </div>
        </div>

        {questionSet.description && (
          <div className="question-set-description">
            <h3>📝 Mô tả</h3>
            <p>{questionSet.description}</p>
          </div>
        )}

        <div className="question-set-meta">
          <span>📅 Tạo: {formatDate(questionSet.createdAt)}</span>
          {questionSet.updatedAt !== questionSet.createdAt && (
            <span>🔄 Cập nhật: {formatDate(questionSet.updatedAt)}</span>
          )}
        </div>
      </div>

      {/* Quiz Attempts History */}
      <div className="attempts-section">
        <div className="section-header">
          <h2>📚 Lịch sử làm bài</h2>
          <span className="attempts-count">
            {completedAttempts.length}/{attempts.length} hoàn thành
          </span>
        </div>

        {loadingAttempts ? (
          <div className="attempts-loading">
            <p>Đang tải lịch sử...</p>
          </div>
        ) : attempts.length > 0 ? (
          <div className="attempts-table">
            <table>
              <thead>
                <tr>
                  <th>Lần</th>
                  <th>Trạng thái</th>
                  <th>Điểm</th>
                  <th>Bắt đầu</th>
                  <th>Hoàn thành</th>
                  <th>Thời gian</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt, index) => {
                  const duration = attempt.completedAt
                    ? Math.floor(
                        (new Date(attempt.completedAt) - new Date(attempt.startedAt)) / 1000 / 60
                      )
                    : null;
                  return (
                    <tr key={attempt.id} className={attempt.isCompleted ? "completed" : "pending"}>
                      <td>#{attempts.length - index}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            attempt.isCompleted ? "completed" : "pending"
                          }`}
                        >
                          {attempt.isCompleted ? "✅ Hoàn thành" : "⏳ Đang làm"}
                        </span>
                      </td>
                      <td>
                        {attempt.isCompleted ? (
                          <span className="score">{attempt.score?.toFixed(1) || 0}</span>
                        ) : (
                          <span className="na">-</span>
                        )}
                      </td>
                      <td>{formatDate(attempt.startedAt)}</td>
                      <td>
                        {attempt.completedAt ? (
                          formatDate(attempt.completedAt)
                        ) : (
                          <span className="na">-</span>
                        )}
                      </td>
                      <td>
                        {duration !== null ? `${duration} phút` : <span className="na">-</span>}
                      </td>
                      <td>
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
          <div className="empty-attempts">
            <p>📭 Chưa có lượt làm bài nào. Hãy bắt đầu làm bài đầu tiên!</p>
            <Button onClick={handleStartQuiz}>🎯 Bắt đầu làm bài</Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionSetDetailPage;
