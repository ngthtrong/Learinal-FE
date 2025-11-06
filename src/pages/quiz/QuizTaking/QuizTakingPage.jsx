/**
 * Quiz Taking Page
 * Main quiz interface with timer and auto-submit
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import questionSetsService from "@/services/api/questionSets.service";
import quizAttemptsService from "@/services/api/quizAttempts.service";
import Button from "@/components/common/Button";
import { useToast, Modal } from "@/components/common";
import { getErrorMessage } from "@/utils/errorHandler";
import "./QuizTakingPage.css";

function QuizTakingPage() {
  const { attemptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  // Settings from QuizStartPage
  const {
    useTimer,
    timerMinutes,
    shuffleQuestions,
    questionSet: initialQuestionSet,
  } = location.state || {};

  const [questionSet, setQuestionSet] = useState(initialQuestionSet);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(!initialQuestionSet);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(useTimer ? timerMinutes * 60 : null);
  const timerRef = useRef(null);
  const autoSubmitRef = useRef(false);

  // Load question set and questions
  useEffect(() => {
    if (!initialQuestionSet) {
      loadQuestionSet();
    } else {
      loadQuestions(initialQuestionSet);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer countdown
  useEffect(() => {
    if (useTimer && timeRemaining !== null) {
      if (timeRemaining <= 0) {
        handleAutoSubmit();
        return;
      }

      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useTimer, timeRemaining]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Prevent accidental page close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const loadQuestionSet = async () => {
    try {
      setLoading(true);
      // Get attempt to find question set ID
      const attempt = await quizAttemptsService.getAttemptById(attemptId);
      const qSet = await questionSetsService.getSetById(attempt.questionSetId);
      setQuestionSet(qSet);
      loadQuestions(qSet);
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
      setTimeout(() => navigate("/question-sets"), 2000);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = (qSet) => {
    if (!qSet || !qSet.questions) {
      toast.showError("Không tìm thấy câu hỏi");
      return;
    }

    let qs = [...qSet.questions];
    if (shuffleQuestions) {
      qs = qs.sort(() => Math.random() - 0.5);
    }
    console.log("Loaded questions:", qs);
    console.log(
      "Question IDs:",
      qs.map((q) => q.id)
    );
    setQuestions(qs);
  };

  const handleAutoSubmit = useCallback(async () => {
    if (autoSubmitRef.current) return;
    autoSubmitRef.current = true;

    toast.showInfo("Hết thời gian! Đang tự động nộp bài...");

    try {
      setSubmitting(true);

      // Prepare answers in the format backend expects
      // Only include answered questions (not -1)
      const answers = questions
        .map((q, index) => {
          const questionKey = q.id || `q-${index}`;
          const answerIndex = userAnswers[questionKey];

          // Skip unanswered questions
          if (answerIndex === undefined || answerIndex === -1) {
            return null;
          }

          return {
            questionId: String(q.id), // Ensure it's a string
            selectedOptionIndex: answerIndex,
          };
        })
        .filter((answer) => answer !== null); // Remove null entries

      console.log("Submitting answers:", answers);

      // Submit to backend with answers array wrapped in object
      await quizAttemptsService.submitAttempt(attemptId, { answers });

      // Navigate to result page
      setTimeout(() => {
        navigate(`/quiz/result/${attemptId}`);
      }, 1000);
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
      setSubmitting(false);
    }
  }, [toast, questions, userAnswers, attemptId, navigate]);

  const handleAnswerSelect = (questionId, optionIndex) => {
    console.log("handleAnswerSelect called:", { questionId, optionIndex });
    setUserAnswers((prev) => {
      const newAnswers = {
        ...prev,
        [questionId]: optionIndex,
      };
      console.log("Updated userAnswers:", newAnswers);
      return newAnswers;
    });
  };

  const handleSubmitQuiz = async (isAutoSubmit = false) => {
    try {
      setSubmitting(true);

      // Prepare answers in the format backend expects
      // Only include answered questions (not -1)
      const answers = questions
        .map((q, index) => {
          const questionKey = q.id || `q${index}`;
          const answerIndex = userAnswers[questionKey];

          // Skip unanswered questions
          if (answerIndex === undefined || answerIndex === -1) {
            return null;
          }

          return {
            questionId: String(q.id), // Ensure it's a string
            selectedOptionIndex: answerIndex,
          };
        })
        .filter((answer) => answer !== null); // Remove null entries

      console.log("Submitting answers:", answers);
      console.log("User answers state:", userAnswers);

      // Submit to backend with answers array wrapped in object
      await quizAttemptsService.submitAttempt(attemptId, { answers });

      if (!isAutoSubmit) {
        toast.showSuccess("Nộp bài thành công!");
      }

      // Navigate to result page
      setTimeout(() => {
        navigate(`/quiz/result/${attemptId}`);
      }, 1000);
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(userAnswers).filter((key) => userAnswers[key] !== undefined).length;
  };

  if (loading) {
    return (
      <div className="quiz-taking-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  if (!questionSet || questions.length === 0) {
    return (
      <div className="quiz-taking-page">
        <div className="empty-state">
          <h2>Không có câu hỏi</h2>
          <Button onClick={() => navigate("/question-sets")}>← Quay lại</Button>
        </div>
      </div>
    );
  }

  const answeredCount = getAnsweredCount();
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
  const isWarningTime = useTimer && timeRemaining !== null && timeRemaining <= 60;

  return (
    <div className="quiz-taking-page">
      {/* Header - Fixed */}
      <div className="quiz-header">
        <div className="quiz-header-left">
          <h1>{questionSet.title}</h1>
          <div className="quiz-meta">
            <span>Tổng số câu: {questions.length}</span>
            <span>•</span>
            <span>
              Đã trả lời: {answeredCount}/{questions.length}
            </span>
          </div>
        </div>
        {useTimer && timeRemaining !== null && (
          <div className={`timer ${isWarningTime ? "warning" : ""}`}>
            <div className="timer-icon">⏱️</div>
            <div className="timer-text">{formatTime(timeRemaining)}</div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        <div className="progress-text">
          {answeredCount}/{questions.length} câu ({Math.round(progress)}%)
        </div>
      </div>

      {/* All Questions List */}
      <div className="quiz-content-all">
        <div className="questions-list">
          {questions.map((question, qIndex) => {
            const questionKey = question.id || `q-${qIndex}`;
            console.log(`Question ${qIndex}:`, {
              id: question.id,
              questionKey: questionKey,
              hasAnswer: userAnswers[questionKey] !== undefined,
              answerValue: userAnswers[questionKey],
            });
            return (
              <div
                key={`question-${questionKey}`}
                className="question-card"
                id={`question-${qIndex}`}
              >
                <div className="question-header">
                  <span className="question-number">Câu hỏi {qIndex + 1}</span>
                  {userAnswers[questionKey] !== undefined && (
                    <span className="answered-badge">✓ Đã trả lời</span>
                  )}
                </div>
                <div className="question-text">{question.questionText}</div>

                <div className="options-list">
                  {question.options?.map((option, optIndex) => {
                    const isSelected = userAnswers[questionKey] === optIndex;
                    return (
                      <div
                        key={`${questionKey}-option-${optIndex}`}
                        className={`option-item ${isSelected ? "selected" : ""}`}
                        onClick={() => handleAnswerSelect(questionKey, optIndex)}
                      >
                        <div className="option-radio">
                          <input
                            type="radio"
                            name={`question-${qIndex}-${questionKey}`}
                            value={optIndex}
                            checked={isSelected}
                            onChange={() => handleAnswerSelect(questionKey, optIndex)}
                          />
                        </div>
                        <div className="option-content">
                          <span className="option-label">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <span className="option-text">{option}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Question Navigator Sidebar */}
        <div className="question-navigator-sidebar">
          <div className="navigator-sticky">
            <h3>Danh sách câu hỏi</h3>
            <div className="question-grid">
              {questions.map((q, index) => {
                const questionKey = q.id || `q-${index}`;
                return (
                  <a
                    key={`question-nav-${questionKey}`}
                    href={`#question-${index}`}
                    className={`question-nav-btn ${
                      userAnswers[questionKey] !== undefined ? "answered" : ""
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(`question-${index}`)?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                  >
                    {index + 1}
                  </a>
                );
              })}
            </div>

            <div className="navigator-stats">
              <div className="stat-item">
                <span className="stat-label">Đã làm:</span>
                <span className="stat-value answered">{answeredCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Chưa làm:</span>
                <span className="stat-value unanswered">{questions.length - answeredCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button - Fixed at bottom */}
      <div className="quiz-actions-fixed">
        <Button
          variant="danger"
          onClick={() => setShowSubmitModal(true)}
          disabled={submitting}
          size="large"
        >
          📝 Nộp bài ({answeredCount}/{questions.length})
        </Button>
      </div>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Xác nhận nộp bài"
      >
        <div className="submit-confirmation">
          <p>
            Bạn đã trả lời <strong>{answeredCount}</strong> / <strong>{questions.length}</strong>{" "}
            câu hỏi.
          </p>
          {answeredCount < questions.length && (
            <p className="warning-text">
              ⚠️ Còn {questions.length - answeredCount} câu chưa trả lời. Bạn có chắc muốn nộp bài
              không?
            </p>
          )}
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowSubmitModal(false);
                handleSubmitQuiz(false);
              }}
              loading={submitting}
            >
              Nộp bài
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default QuizTakingPage;
