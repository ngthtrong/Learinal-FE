/**
 * QuizResultPage Component
 * Display quiz results with detailed answers and explanations
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import Button from "@/components/common/Button";
import { quizAttemptsService } from "@/services/api";
import "./QuizResultPage.css";

function QuizResultPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  // State
  const [attempt, setAttempt] = useState(null);
  const [filter, setFilter] = useState("all"); // all, correct, incorrect
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load attempt result
  useEffect(() => {
    const loadResult = async () => {
      try {
        setLoading(true);
        const data = await quizAttemptsService.getAttemptById(attemptId);
        setAttempt(data);
      } catch (err) {
        setError(err.response?.data?.message || "Không thể tải kết quả");
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) {
      loadResult();
    }
  }, [attemptId]);

  // Calculate statistics
  const getStatistics = () => {
    if (!attempt || !attempt.userAnswers) {
      return { total: 0, correct: 0, incorrect: 0, unanswered: 0 };
    }

    const total = attempt.userAnswers.length;
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    attempt.userAnswers.forEach((answer) => {
      if (answer.isCorrect === true) {
        correct++;
      } else if (answer.isCorrect === false) {
        incorrect++;
      } else {
        unanswered++;
      }
    });

    return { total, correct, incorrect, unanswered };
  };

  // Filter questions
  const getFilteredQuestions = () => {
    if (!attempt || !attempt.userAnswers) return [];

    switch (filter) {
      case "correct":
        return attempt.userAnswers.filter((q) => q.isCorrect === true);
      case "incorrect":
        return attempt.userAnswers.filter((q) => q.isCorrect === false);
      default:
        return attempt.userAnswers;
    }
  };

  // Handle retry
  const handleRetry = () => {
    navigate(`/quiz/${attempt.questionSet._id}/take`);
  };

  if (loading) {
    return (
      <div className="quiz-result-page loading">
        <div className="spinner"></div>
        <p>Đang tải kết quả...</p>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="quiz-result-page error">
        <h2>❌ Lỗi</h2>
        <p>{error || "Không tìm thấy kết quả"}</p>
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
      </div>
    );
  }

  const stats = getStatistics();
  const filteredQuestions = getFilteredQuestions();
  const scorePercentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  return (
    <div className="quiz-result-page">
      {/* Header */}
      <div className="result-header">
        <h1>Kết quả bài thi</h1>
        <p className="quiz-name">{attempt.questionSet?.title || attempt.questionSet?.name}</p>
      </div>

      {/* Score Card */}
      <div className="score-card">
        <div className="score-circle">
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="#e5e7eb" strokeWidth="20" />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={
                scorePercentage >= 80 ? "#22c55e" : scorePercentage >= 50 ? "#f59e0b" : "#ef4444"
              }
              strokeWidth="20"
              strokeDasharray={`${(scorePercentage / 100) * 565} 565`}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
            />
          </svg>
          <div className="score-text">
            <span className="score-number">{attempt.score || 0}</span>
            <span className="score-label">điểm</span>
          </div>
        </div>

        <div className="score-details">
          <div className="stat-row">
            <span className="stat-label">Tổng số câu:</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-row correct">
            <span className="stat-label">✓ Đúng:</span>
            <span className="stat-value">{stats.correct}</span>
          </div>
          <div className="stat-row incorrect">
            <span className="stat-label">✗ Sai:</span>
            <span className="stat-value">{stats.incorrect}</span>
          </div>
          <div className="stat-row unanswered">
            <span className="stat-label">○ Chưa làm:</span>
            <span className="stat-value">{stats.unanswered}</span>
          </div>
          <div className="stat-row accuracy">
            <span className="stat-label">Độ chính xác:</span>
            <span className="stat-value">{scorePercentage}%</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="result-actions">
        <Button variant="secondary" onClick={() => navigate("/dashboard")}>
          Về Dashboard
        </Button>
        <Button onClick={handleRetry}>🔄 Làm lại</Button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          Tất cả ({stats.total})
        </button>
        <button
          className={`filter-tab ${filter === "correct" ? "active" : ""}`}
          onClick={() => setFilter("correct")}
        >
          ✓ Đúng ({stats.correct})
        </button>
        <button
          className={`filter-tab ${filter === "incorrect" ? "active" : ""}`}
          onClick={() => setFilter("incorrect")}
        >
          ✗ Sai ({stats.incorrect})
        </button>
      </div>

      {/* Questions Detail */}
      <div className="questions-detail">
        {filteredQuestions.length === 0 ? (
          <div className="no-questions">Không có câu hỏi nào</div>
        ) : (
          filteredQuestions.map((answer, index) => {
            const question = answer.question || {};
            const userAnswerIndex = answer.selectedOptionIndex; // Changed from selectedAnswerIndex
            const correctAnswerIndex = question.correctAnswerIndex;
            const isCorrect = answer.isCorrect;

            return (
              <div
                key={answer.questionId || answer._id || index}
                className={`question-item ${isCorrect ? "correct" : "incorrect"}`}
              >
                <div className="question-item-header">
                  <span className="question-number">Câu {index + 1}</span>
                  <span className={`result-badge ${isCorrect ? "correct" : "incorrect"}`}>
                    {isCorrect ? "✓ Đúng" : "✗ Sai"}
                  </span>
                </div>

                <div className="question-text">{question.questionText}</div>

                <div className="answers-review">
                  {question.options?.map((option, optIndex) => {
                    const isUserAnswer = userAnswerIndex === optIndex;
                    const isCorrectAnswer = correctAnswerIndex === optIndex;

                    let answerClass = "";
                    if (isCorrectAnswer) {
                      answerClass = "correct-answer";
                    } else if (isUserAnswer && !isCorrect) {
                      answerClass = "wrong-answer";
                    }

                    return (
                      <div
                        key={`${answer.questionId}-option-${optIndex}`}
                        className={`answer-review ${answerClass}`}
                      >
                        <span className="answer-letter">{String.fromCharCode(65 + optIndex)}.</span>
                        <span className="answer-text">{option}</span>
                        {isCorrectAnswer && (
                          <span className="correct-indicator">✓ Đáp án đúng</span>
                        )}
                        {isUserAnswer && !isCorrect && (
                          <span className="wrong-indicator">✗ Bạn đã chọn</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {question.explanation && (
                  <div className="explanation">
                    <strong>💡 Lời giải:</strong>
                    <p>{question.explanation}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default QuizResultPage;
