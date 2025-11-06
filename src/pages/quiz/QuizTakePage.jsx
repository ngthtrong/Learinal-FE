/**
 * QuizTakePage Component
 * Full-screen quiz taking interface with timer and auto-save
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import Button from "@/components/common/Button";
import { questionSetsService, quizAttemptsService } from "@/services/api";
import "./QuizTakePage.css";

function QuizTakePage() {
  const { setId } = useParams();
  const navigate = useNavigate();

  // State
  const [questionSet, setQuestionSet] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [error, setError] = useState("");

  const autoSaveTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  // Load question set and start attempt
  useEffect(() => {
    const initQuiz = async () => {
      try {
        setLoading(true);

        // Load question set
        const set = await questionSetsService.getSetById(setId);
        setQuestionSet(set);

        // Create attempt
        const attempt = await quizAttemptsService.createAttempt({
          setId,
          startTime: new Date().toISOString(),
        });
        setAttemptId(attempt.attemptId);

        // Initialize timer if there's a time limit
        if (attempt.timeLimit) {
          setTimeRemaining(attempt.timeLimit);
        }

        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Không thể tải bài thi");
        setLoading(false);
      }
    };

    if (setId) {
      initQuiz();
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [setId]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    countdownTimerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - auto submit
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [timeRemaining, handleSubmit]);

  // Auto-save answers
  const autoSaveAnswer = useCallback(
    async (questionId, selectedAnswerIndex) => {
      if (!attemptId) return;

      try {
        await quizAttemptsService.saveAnswer(attemptId, {
          questionId,
          selectedAnswerIndex,
        });
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    },
    [attemptId]
  );

  // Handle answer selection
  const handleAnswerSelect = (answerIndex) => {
    const currentQuestion = questionSet.questions[currentQuestionIndex];

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion._id]: answerIndex,
    }));

    // Schedule auto-save
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveAnswer(currentQuestion._id, answerIndex);
    }, 1000);
  };

  // Navigate to question
  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  // Mark for review
  const toggleMarkForReview = () => {
    const currentQuestion = questionSet.questions[currentQuestionIndex];
    setMarkedForReview((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion._id)) {
        newSet.delete(currentQuestion._id);
      } else {
        newSet.add(currentQuestion._id);
      }
      return newSet;
    });
  };

  // Handle submit
  const handleSubmit = useCallback(
    async (isAutoSubmit = false) => {
      if (!isAutoSubmit) {
        setShowSubmitConfirm(true);
        return;
      }

      try {
        setSubmitting(true);

        // Prepare answers array
        const answersArray = questionSet.questions.map((q) => ({
          questionId: q._id,
          selectedAnswerIndex: userAnswers[q._id] ?? -1,
        }));

        // Submit attempt
        await quizAttemptsService.submitAttempt(attemptId, {
          endTime: new Date().toISOString(),
          userAnswers: answersArray,
        });

        // Navigate to result page
        navigate(`/quiz/${attemptId}/result`, { replace: true });
      } catch (err) {
        setError(err.response?.data?.message || "Không thể nộp bài");
        setSubmitting(false);
      }
    },
    [attemptId, questionSet, userAnswers, navigate]
  );

  // Confirm submit
  const confirmSubmit = () => {
    setShowSubmitConfirm(false);
    handleSubmit(true);
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate progress
  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestions = questionSet?.questions?.length || 0;
  const progressPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  if (loading) {
    return (
      <div className="quiz-take-page loading">
        <div className="spinner"></div>
        <p>Đang tải bài thi...</p>
      </div>
    );
  }

  if (error || !questionSet) {
    return (
      <div className="quiz-take-page error">
        <h2>❌ Lỗi</h2>
        <p>{error || "Không tìm thấy bài thi"}</p>
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
      </div>
    );
  }

  const currentQuestion = questionSet.questions[currentQuestionIndex];
  const isMarked = markedForReview.has(currentQuestion._id);

  return (
    <div className="quiz-take-page">
      {/* Header */}
      <header className="quiz-header">
        <div className="quiz-title">
          <h1>{questionSet.title || questionSet.name}</h1>
          <span className="question-count">
            Câu {currentQuestionIndex + 1}/{totalQuestions}
          </span>
        </div>
        <div className="quiz-controls">
          {timeRemaining !== null && (
            <div className={`timer ${timeRemaining < 300 ? "warning" : ""}`}>
              ⏱️ {formatTime(timeRemaining)}
            </div>
          )}
          <Button onClick={() => setShowSubmitConfirm(true)} disabled={submitting}>
            Nộp bài
          </Button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <span className="progress-text">{Math.round(progressPercentage)}%</span>
      </div>

      {/* Main Content */}
      <div className="quiz-content">
        {/* Question Panel */}
        <main className="question-panel">
          <div className="question-header">
            <h2>Câu {currentQuestionIndex + 1}:</h2>
            <button
              className={`mark-review-btn ${isMarked ? "marked" : ""}`}
              onClick={toggleMarkForReview}
            >
              {isMarked ? "🚩 Đã đánh dấu" : "🚩 Đánh dấu để xem lại"}
            </button>
          </div>

          <div className="question-text">{currentQuestion.questionText}</div>

          <div className="answers-list">
            {currentQuestion.options?.map((option, index) => (
              <label
                key={index}
                className={`answer-option ${
                  userAnswers[currentQuestion._id] === index ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion._id}`}
                  checked={userAnswers[currentQuestion._id] === index}
                  onChange={() => handleAnswerSelect(index)}
                />
                <span className="option-label">
                  {String.fromCharCode(65 + index)}. {option}
                </span>
              </label>
            ))}
          </div>

          {/* Navigation */}
          <div className="question-navigation">
            <Button
              variant="secondary"
              onClick={() => goToQuestion(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0}
            >
              ← Câu trước
            </Button>
            <Button
              variant="secondary"
              onClick={() => goToQuestion(currentQuestionIndex + 1)}
              disabled={currentQuestionIndex === totalQuestions - 1}
            >
              Câu sau →
            </Button>
          </div>
        </main>

        {/* Sidebar - Question Overview */}
        <aside className="question-overview">
          <h3>Tổng quan</h3>
          <div className="questions-grid">
            {questionSet.questions.map((q, index) => {
              const answered = userAnswers[q._id] !== undefined;
              const marked = markedForReview.has(q._id);

              return (
                <button
                  key={q._id}
                  className={`question-num ${answered ? "answered" : ""} ${
                    marked ? "marked" : ""
                  } ${index === currentQuestionIndex ? "current" : ""}`}
                  onClick={() => goToQuestion(index)}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          <div className="overview-stats">
            <div className="stat-item">
              <span className="stat-icon answered">✓</span>
              <span>Đã làm: {answeredCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon unanswered">○</span>
              <span>Chưa làm: {totalQuestions - answeredCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon marked">🚩</span>
              <span>Đánh dấu: {markedForReview.size}</span>
            </div>
          </div>

          <Button variant="outline" fullWidth onClick={() => goToQuestion(0)}>
            Xem lại tất cả
          </Button>
        </aside>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="modal-overlay" onClick={() => setShowSubmitConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Xác nhận nộp bài</h2>
            <p>
              Bạn đã hoàn thành {answeredCount}/{totalQuestions} câu hỏi.
              {answeredCount < totalQuestions && (
                <strong> Còn {totalQuestions - answeredCount} câu chưa làm.</strong>
              )}
            </p>
            <p>Bạn có chắc chắn muốn nộp bài không?</p>
            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setShowSubmitConfirm(false)}>
                Hủy
              </Button>
              <Button onClick={confirmSubmit} loading={submitting}>
                Nộp bài
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizTakePage;
