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
      // Get attempt to find question set ID and restore answers
      const attempt = await quizAttemptsService.getAttemptById(attemptId);
      const qSet = await questionSetsService.getSetById(attempt.setId);
      setQuestionSet(qSet);
      loadQuestions(qSet);

      // Restore saved answers if continuing an incomplete attempt
      if (attempt.userAnswers && Array.isArray(attempt.userAnswers)) {
        const restoredAnswers = {};
        attempt.userAnswers.forEach((answer) => {
          if (answer.questionId !== undefined && answer.selectedOptionIndex !== undefined) {
            restoredAnswers[answer.questionId] = answer.selectedOptionIndex;
          }
        });
        console.log("Restored answers:", restoredAnswers);
        setUserAnswers(restoredAnswers);
      }
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
          const questionKey = q.questionId || `q-${index}`;
          const answerIndex = userAnswers[questionKey];

          // Skip unanswered questions
          if (answerIndex === undefined || answerIndex === -1) {
            return null;
          }

          return {
            questionId: String(q.questionId), // Use q.questionId to match backend
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
          const questionKey = q.questionId || `q${index}`;
          const answerIndex = userAnswers[questionKey];

          // Skip unanswered questions
          if (answerIndex === undefined || answerIndex === -1) {
            return null;
          }

          return {
            questionId: String(q.questionId), // Use q.questionId to match backend
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
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block w-12 h-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải bài thi...</p>
        </div>
      </div>
    );
  }

  if (!questionSet || questions.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Không có câu hỏi</h2>
          <Button onClick={() => navigate("/question-sets")}>← Quay lại</Button>
        </div>
      </div>
    );
  }

  const answeredCount = getAnsweredCount();
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
  const isWarningTime = useTimer && timeRemaining !== null && timeRemaining <= 60;

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-24">
      {/* Header - Fixed */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {questionSet.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="font-medium">Tổng số câu:</span> {questions.length}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="font-medium">Đã trả lời:</span>
                  <span className="text-primary-600 font-bold">
                    {answeredCount}/{questions.length}
                  </span>
                </span>
              </div>
            </div>
            {useTimer && timeRemaining !== null && (
              <div
                className={`flex items-center gap-3 px-6 py-3 rounded-lg font-bold text-lg ${
                  isWarningTime
                    ? "bg-error-50 dark:bg-red-900/30 text-error-700 dark:text-red-300 border-2 border-error-300 dark:border-red-700 animate-pulse"
                    : "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-2 border-primary-200 dark:border-primary-700"
                }`}
              >
                <span className="text-2xl">⏱️</span>
                <span className="text-xl font-mono">{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-200 dark:bg-gray-700">
          <div
            className="absolute top-0 left-0 h-full bg-linear-to-r from-primary-500 to-secondary-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 px-2 py-0.5 rounded shadow-sm">
          {answeredCount}/{questions.length} câu ({Math.round(progress)}%)
        </div>
      </div>

      {/* All Questions List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {questions.map((question, qIndex) => {
              const questionKey = question.questionId || `q-${qIndex}`;
              console.log(`Question ${qIndex}:`, {
                id: question.id,
                questionKey: questionKey,
                hasAnswer: userAnswers[questionKey] !== undefined,
                answerValue: userAnswers[questionKey],
              });
              return (
                <div
                  key={`question-${questionKey}`}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-medium border border-gray-200 dark:border-gray-700 p-6 scroll-mt-32"
                  id={`question-${qIndex}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      Câu hỏi {qIndex + 1}
                    </span>
                    {userAnswers[questionKey] !== undefined && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 rounded-full text-sm font-medium">
                        ✓ Đã trả lời
                      </span>
                    )}
                  </div>
                  <div className="text-gray-900 dark:text-gray-100 text-lg font-medium mb-6 leading-relaxed">
                    {question.questionText}
                  </div>

                  <div className="space-y-3">
                    {question.options?.map((option, optIndex) => {
                      const isSelected = userAnswers[questionKey] === optIndex;
                      return (
                        <div
                          key={`${questionKey}-option-${optIndex}`}
                          className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-sm ${
                            isSelected
                              ? "border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20"
                              : "border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-500 bg-white dark:bg-gray-800"
                          }`}
                          onClick={() => handleAnswerSelect(questionKey, optIndex)}
                        >
                          <div className="flex items-center justify-center w-6 h-6 mt-0.5">
                            <input
                              type="radio"
                              name={`question-${qIndex}-${questionKey}`}
                              value={optIndex}
                              checked={isSelected}
                              onChange={() => handleAnswerSelect(questionKey, optIndex)}
                              className="w-5 h-5 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 cursor-pointer"
                            />
                          </div>
                          <div className="flex-1 flex items-start gap-2">
                            <span className="font-bold text-gray-700 dark:text-gray-300 min-w-6">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            <span
                              className={`flex-1 ${
                                isSelected ? "text-primary-900 dark:text-primary-200 font-medium" : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {option}
                            </span>
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
          <div className="lg:col-span-1">
            <div className="sticky top-36 bg-white dark:bg-gray-800 rounded-xl shadow-medium border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                Danh sách câu hỏi
              </h3>
              <div className="grid grid-cols-5 gap-2 mb-6">
                {questions.map((q, index) => {
                  const questionKey = q.questionId || `q-${index}`;
                  const isAnswered = userAnswers[questionKey] !== undefined;
                  return (
                    <button
                      key={`question-nav-${questionKey}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(`question-${index}`)?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }}
                      className={`w-full aspect-square flex items-center justify-center rounded-lg font-bold text-sm transition-all ${
                        isAnswered
                          ? "bg-success-500 dark:bg-green-600 text-white hover:bg-success-600 dark:hover:bg-green-700 shadow-sm"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Đã làm:</span>
                  <span className="text-lg font-bold text-success-600 dark:text-green-400">{answeredCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Chưa làm:</span>
                  <span className="text-lg font-bold text-gray-500 dark:text-gray-400">
                    {questions.length - answeredCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="primary"
            onClick={() => setShowSubmitModal(true)}
            disabled={submitting}
            size="large"
            className="w-full sm:w-auto"
          >
            📝 Nộp bài ({answeredCount}/{questions.length})
          </Button>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Xác nhận nộp bài"
      >
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              Bạn đã trả lời <strong className="text-primary-600 dark:text-primary-400">{answeredCount}</strong> /{" "}
              <strong className="dark:text-gray-100">{questions.length}</strong> câu hỏi.
            </p>
          </div>
          {answeredCount < questions.length && (
            <div className="bg-warning-50 dark:bg-yellow-900/20 border border-warning-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-warning-800 dark:text-yellow-300 flex items-start gap-2">
                <span className="text-xl">⚠️</span>
                <span>
                  Còn <strong>{questions.length - answeredCount}</strong> câu chưa trả lời. Bạn có
                  chắc muốn nộp bài không?
                </span>
              </p>
            </div>
          )}
          <div className="flex items-center justify-end gap-3 pt-4">
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

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            © 2025 Learinal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default QuizTakingPage;
