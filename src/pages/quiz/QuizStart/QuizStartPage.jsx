/**
 * Quiz Start Page
 * Configure quiz settings before starting (timer, shuffle, etc.)
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import questionSetsService from "@/services/api/questionSets.service";
import quizAttemptsService from "@/services/api/quizAttempts.service";
import Button from "@/components/common/Button";
import { useToast } from "@/components/common";
import { getErrorMessage } from "@/utils/errorHandler";
import "./QuizStartPage.css";

function QuizStartPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [questionSet, setQuestionSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  // Quiz settings
  const [useTimer, setUseTimer] = useState(true);
  const [timerMinutes, setTimerMinutes] = useState(60);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);

  useEffect(() => {
    fetchQuestionSet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchQuestionSet = async () => {
    try {
      setLoading(true);
      const data = await questionSetsService.getSetById(id);
      setQuestionSet(data);
      // Set default timer based on question count (2 minutes per question)
      const defaultTime = Math.max(30, Math.min(120, (data.questionCount || 10) * 2));
      setTimerMinutes(defaultTime);
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
      setTimeout(() => navigate(`/question-sets/${id}`), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    try {
      setStarting(true);

      // Create quiz attempt
      const attempt = await quizAttemptsService.createAttempt({
        setId: id,
      });

      toast.showSuccess("Bắt đầu làm bài!");

      // Navigate to quiz taking page with settings
      navigate(`/quiz/take/${attempt.id}`, {
        state: {
          useTimer,
          timerMinutes,
          shuffleQuestions,
          questionSet,
        },
      });
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="quiz-start-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!questionSet) {
    return null;
  }

  return (
    <div className="quiz-start-page">
      <div className="quiz-start-container">
        {/* Header */}
        <div className="quiz-start-header">
          <Button variant="secondary" onClick={() => navigate(`/question-sets/${id}`)}>
            ← Quay lại
          </Button>
        </div>

        {/* Quiz Info */}
        <div className="quiz-info-card">
          <div className="quiz-icon">🎯</div>
          <h1>{questionSet.title}</h1>
          {questionSet.description && <p className="quiz-description">{questionSet.description}</p>}

          <div className="quiz-info-stats">
            <div className="info-stat">
              <span className="stat-icon">📊</span>
              <span className="stat-text">
                <strong>{questionSet.questionCount || 0}</strong> câu hỏi
              </span>
            </div>
            {useTimer && (
              <div className="info-stat">
                <span className="stat-icon">⏱️</span>
                <span className="stat-text">
                  <strong>{timerMinutes}</strong> phút
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="quiz-settings-card">
          <h2>⚙️ Cài đặt bài thi</h2>

          {/* Timer Setting */}
          <div className="setting-group">
            <div className="setting-header">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={useTimer}
                  onChange={(e) => setUseTimer(e.target.checked)}
                  className="setting-checkbox"
                />
                <span>⏱️ Sử dụng bộ đếm thời gian</span>
              </label>
            </div>
            {useTimer && (
              <div className="setting-content">
                <div className="timer-controls">
                  <label htmlFor="timer-minutes">Thời gian (phút):</label>
                  <div className="timer-input-group">
                    <button
                      type="button"
                      onClick={() => setTimerMinutes(Math.max(10, timerMinutes - 10))}
                      className="timer-btn"
                    >
                      −
                    </button>
                    <input
                      id="timer-minutes"
                      type="number"
                      min="10"
                      max="180"
                      value={timerMinutes}
                      onChange={(e) =>
                        setTimerMinutes(Math.max(10, parseInt(e.target.value) || 10))
                      }
                      className="timer-input"
                    />
                    <button
                      type="button"
                      onClick={() => setTimerMinutes(Math.min(180, timerMinutes + 10))}
                      className="timer-btn"
                    >
                      +
                    </button>
                  </div>
                </div>
                <p className="setting-note">
                  ⚠️ Hết thời gian sẽ tự động nộp bài. Đảm bảo bạn có đủ thời gian để hoàn thành.
                </p>
              </div>
            )}
          </div>

          {/* Shuffle Setting */}
          <div className="setting-group">
            <label className="setting-label">
              <input
                type="checkbox"
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
                className="setting-checkbox"
              />
              <span>🔀 Xáo trộn câu hỏi</span>
            </label>
            <p className="setting-description">Các câu hỏi sẽ xuất hiện theo thứ tự ngẫu nhiên</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="quiz-instructions">
          <h3>📋 Hướng dẫn</h3>
          <ul>
            <li>Đọc kỹ từng câu hỏi trước khi chọn đáp án</li>
            <li>Chỉ có thể chọn một đáp án cho mỗi câu hỏi</li>
            <li>Có thể xem lại và thay đổi câu trả lời trước khi nộp bài</li>
            {useTimer && (
              <li>
                <strong>Khi hết thời gian, bài thi sẽ tự động được nộp</strong>
              </li>
            )}
            <li>Sau khi nộp bài, bạn sẽ xem được kết quả và đáp án chi tiết</li>
          </ul>
        </div>

        {/* Start Button */}
        <div className="quiz-start-actions">
          <Button
            variant="primary"
            size="large"
            onClick={handleStartQuiz}
            loading={starting}
            disabled={starting}
          >
            {starting ? "Đang khởi tạo..." : "🚀 Bắt đầu làm bài"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default QuizStartPage;
