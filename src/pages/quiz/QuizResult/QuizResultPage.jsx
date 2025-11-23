/**
 * QuizResultPage Component
 * Display quiz results with detailed answers and explanations
 */

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import Button from "@/components/common/Button";
import { quizAttemptsService, questionSetsService } from "@/services/api";
import { getErrorMessage } from "@/utils/errorHandler";

function QuizResultPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  // State
  const [attempt, setAttempt] = useState(null);
  const [questionSet, setQuestionSet] = useState(null);
  const [filter, setFilter] = useState("all"); // all, correct, incorrect
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load attempt result
  useEffect(() => {
    const loadResult = async () => {
      try {
        setLoading(true);
        setError("");

        const attemptData = await quizAttemptsService.getAttemptById(attemptId);
        setAttempt(attemptData);

        // Determine question set information
        let resolvedQuestionSet = null;

        if (attemptData?.questionSet?.questions?.length) {
          resolvedQuestionSet = attemptData.questionSet;
        } else {
          const questionSetId =
            attemptData?.questionSetId ||
            attemptData?.questionSet?._id ||
            attemptData?.questionSet?.id;

          if (questionSetId) {
            try {
              resolvedQuestionSet = await questionSetsService.getSetById(questionSetId);
            } catch (fetchErr) {
              console.warn("Không thể tải thông tin bộ câu hỏi:", fetchErr);
            }
          }
        }

        if (resolvedQuestionSet) {
          setQuestionSet(resolvedQuestionSet);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) {
      loadResult();
    }
  }, [attemptId]);

  const rawAnswers = useMemo(() => {
    if (!attempt) return [];
    if (Array.isArray(attempt.answers) && attempt.answers.length > 0) return attempt.answers;
    if (Array.isArray(attempt.userAnswers) && attempt.userAnswers.length > 0)
      return attempt.userAnswers;
    if (Array.isArray(attempt.result?.answers) && attempt.result.answers.length > 0)
      return attempt.result.answers;
    return [];
  }, [attempt]);

  const answersMap = useMemo(() => {
    const map = new Map();
    rawAnswers.forEach((answer) => {
      const key = String(
        answer?.questionId ||
          answer?.question?._id ||
          answer?.question?.id ||
          answer?.question?.questionId ||
          ""
      );
      if (key) {
        map.set(key, answer);
      }
    });
    return map;
  }, [rawAnswers]);

  const enrichedAnswers = useMemo(() => {
    if (questionSet?.questions?.length) {
      return questionSet.questions.map((question, index) => {
        const questionKey = String(
          question?.id || question?._id || question?.questionId || `q-${index}`
        );
        const baseAnswer = answersMap.get(questionKey) || {};
        const selectedOptionIndex =
          baseAnswer?.selectedOptionIndex ??
          baseAnswer?.selectedAnswerIndex ??
          baseAnswer?.selectedOption;

        const correctAnswerIndex =
          baseAnswer?.correctAnswerIndex ??
          question?.correctAnswerIndex ??
          (Array.isArray(question?.correctAnswers) ? question.correctAnswers[0] : undefined);

        const isCorrect =
          typeof baseAnswer?.isCorrect === "boolean"
            ? baseAnswer.isCorrect
            : selectedOptionIndex !== undefined &&
              selectedOptionIndex !== null &&
              selectedOptionIndex !== -1 &&
              correctAnswerIndex !== undefined &&
              correctAnswerIndex !== null
            ? selectedOptionIndex === correctAnswerIndex
            : null;

        return {
          ...baseAnswer,
          question,
          questionId: questionKey,
          index,
          selectedOptionIndex,
          correctAnswerIndex,
          isCorrect,
          explanation: baseAnswer?.explanation ?? question?.explanation,
        };
      });
    }

    if (rawAnswers.length) {
      return rawAnswers.map((answer, index) => {
        const selectedOptionIndex =
          answer?.selectedOptionIndex ?? answer?.selectedAnswerIndex ?? answer?.selectedOption;
        const correctAnswerIndex =
          answer?.correctAnswerIndex ??
          answer?.question?.correctAnswerIndex ??
          (Array.isArray(answer?.question?.correctAnswers)
            ? answer.question.correctAnswers[0]
            : undefined);

        const isCorrect =
          typeof answer?.isCorrect === "boolean"
            ? answer.isCorrect
            : selectedOptionIndex !== undefined &&
              selectedOptionIndex !== null &&
              selectedOptionIndex !== -1 &&
              correctAnswerIndex !== undefined &&
              correctAnswerIndex !== null
            ? selectedOptionIndex === correctAnswerIndex
            : null;

        return {
          ...answer,
          question: answer?.question,
          questionId:
            answer?.questionId ||
            answer?.question?._id ||
            answer?.question?.id ||
            answer?.question?.questionId ||
            `q-${index}`,
          index,
          selectedOptionIndex,
          correctAnswerIndex,
          isCorrect,
          explanation: answer?.explanation ?? answer?.question?.explanation,
        };
      });
    }

    return [];
  }, [questionSet, answersMap, rawAnswers]);

  const stats = useMemo(() => {
    const totalQuestions =
      questionSet?.questions?.length ?? attempt?.totalQuestions ?? enrichedAnswers.length;

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    enrichedAnswers.forEach((answer) => {
      const selected = answer?.selectedOptionIndex;
      if (selected === undefined || selected === null || selected === -1) {
        unansweredCount += 1;
        return;
      }

      if (answer?.isCorrect === true) {
        correctCount += 1;
      } else if (answer?.isCorrect === false) {
        incorrectCount += 1;
      } else {
        // If we cannot determine correctness but user answered, treat as incorrect
        incorrectCount += 1;
      }
    });

    const remaining = totalQuestions - enrichedAnswers.length;
    if (remaining > 0) {
      unansweredCount += remaining;
    }

    return {
      total: totalQuestions,
      correct: correctCount,
      incorrect: incorrectCount,
      unanswered: Math.max(unansweredCount, 0),
    };
  }, [enrichedAnswers, questionSet, attempt]);

  const filteredQuestions = useMemo(() => {
    switch (filter) {
      case "correct":
        return enrichedAnswers.filter((answer) => answer?.isCorrect === true);
      case "incorrect":
        return enrichedAnswers.filter((answer) => {
          const selected = answer?.selectedOptionIndex;
          return (
            selected !== undefined &&
            selected !== null &&
            selected !== -1 &&
            answer?.isCorrect === false
          );
        });
      default:
        return enrichedAnswers;
    }
  }, [enrichedAnswers, filter]);

  // Handle retry
  const handleRetry = () => {
    const questionSetId =
      attempt?.questionSetId ||
      attempt?.questionSet?._id ||
      attempt?.questionSet?.id ||
      questionSet?._id ||
      questionSet?.id;

    if (questionSetId) {
      navigate(`/quiz/start/${questionSetId}`);
    } else {
      navigate("/quiz");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">Đang tải kết quả...</p>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Đã xảy ra lỗi</h2>
          <p className="text-gray-600 mb-6">{error || "Không tìm thấy kết quả bài thi"}</p>
          <Button onClick={() => navigate(-1)} className="w-full justify-center">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const scorePercentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  const scoreValue =
    attempt?.score !== undefined && attempt?.score !== null ? attempt.score : stats.correct;
  const formattedScore =
    typeof scoreValue === "number"
      ? Number.isInteger(scoreValue)
        ? scoreValue
        : scoreValue.toFixed(1)
      : scoreValue || 0;

  // Determine color based on score
  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "text-green-500 stroke-green-500";
    if (percentage >= 50) return "text-yellow-500 stroke-yellow-500";
    return "text-red-500 stroke-red-500";
  };

  const scoreColorClass = getScoreColor(scorePercentage);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kết quả bài thi</h1>
          <p className="text-lg text-gray-600">
            {questionSet?.title ||
              attempt?.questionSet?.title ||
              attempt?.questionSet?.name ||
              "Chi tiết kết quả"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Score Summary (Sticky on Desktop) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
              <div className="flex flex-col items-center mb-8">
                <div className="relative w-48 h-48 mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-100 stroke-current"
                      strokeWidth="8"
                      fill="none"
                      cx="50"
                      cy="50"
                      r="40"
                    />
                    <circle
                      className={`${scoreColorClass} transition-all duration-1000 ease-out`}
                      strokeWidth="8"
                      strokeDasharray={`${scorePercentage * 2.51} 251`}
                      strokeLinecap="round"
                      fill="none"
                      cx="50"
                      cy="50"
                      r="40"
                    />
                  </svg>
                  <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                    <span className={`text-4xl font-bold ${scoreColorClass.split(" ")[0]}`}>
                      {formattedScore}
                    </span>
                    <span className="text-sm text-gray-500 font-medium uppercase tracking-wide mt-1">
                      Điểm
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500 mb-1">Độ chính xác</div>
                  <div className="text-2xl font-bold text-gray-900">{scorePercentage}%</div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Tổng số câu</span>
                  <span className="font-bold text-gray-900">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                  <span className="flex items-center text-green-700">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Đúng
                  </span>
                  <span className="font-bold text-green-700">{stats.correct}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                  <span className="flex items-center text-red-700">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Sai
                  </span>
                  <span className="font-bold text-red-700">{stats.incorrect}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="flex items-center text-gray-600">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    Chưa làm
                  </span>
                  <span className="font-bold text-gray-700">{stats.unanswered}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleRetry}
                  className="w-full justify-center py-3 text-base shadow-md hover:shadow-lg transition-all"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.051M20.418 9c-.775-4.256-4.499-7.5-8.918-7.5-5.25 0-9.5 4.25-9.5 9.5 0 2.79 1.213 5.308 3.118 7.05M20 20v-5h-.051M3.582 15c.775 4.256 4.499 7.5 8.918 7.5 5.25 0 9.5-4.25 9.5-9.5 0-2.79-1.213-5.308-3.118-7.05"
                    />
                  </svg>
                  Làm lại bài thi
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate("/home")}
                  className="w-full justify-center py-3 text-base"
                >
                  Về trang chủ
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Review */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-6 flex overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setFilter("all")}
                className={`flex-1 min-w-[100px] py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  filter === "all"
                    ? "bg-primary-50 text-primary-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Tất cả ({stats.total})
              </button>
              <button
                onClick={() => setFilter("correct")}
                className={`flex-1 min-w-[100px] py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  filter === "correct"
                    ? "bg-green-50 text-green-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Đúng ({stats.correct})
              </button>
              <button
                onClick={() => setFilter("incorrect")}
                className={`flex-1 min-w-[100px] py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  filter === "incorrect"
                    ? "bg-red-50 text-red-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Sai ({stats.incorrect})
              </button>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {filteredQuestions.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">Không có câu hỏi nào trong mục này</p>
                </div>
              ) : (
                filteredQuestions.map((answer, index) => {
                  const question = answer?.question || {};
                  const userAnswerIndex = answer?.selectedOptionIndex;
                  const correctAnswerIndex =
                    answer?.correctAnswerIndex ?? question?.correctAnswerIndex;
                  const isCorrect = answer?.isCorrect === true;
                  const isUnanswered =
                    userAnswerIndex === undefined ||
                    userAnswerIndex === null ||
                    userAnswerIndex === -1;

                  const questionNumber = (answer?.index ?? index) + 1;
                  const questionText =
                    question?.questionText ||
                    question?.content ||
                    answer?.questionText ||
                    "Không tìm thấy nội dung câu hỏi";
                  const options = question?.options || answer?.options || [];

                  // Determine card styling based on status
                  let cardBorderClass = "border-gray-100";
                  let badgeClass = "bg-gray-100 text-gray-600";
                  let badgeIcon = null;
                  let badgeText = "Chưa trả lời";

                  if (isCorrect) {
                    cardBorderClass = "border-green-200 ring-1 ring-green-50";
                    badgeClass = "bg-green-100 text-green-700";
                    badgeIcon = (
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    );
                    badgeText = "Đúng";
                  } else if (!isUnanswered) {
                    cardBorderClass = "border-red-200 ring-1 ring-red-50";
                    badgeClass = "bg-red-100 text-red-700";
                    badgeIcon = (
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    );
                    badgeText = "Sai";
                  }

                  return (
                    <div
                      key={answer?.questionId || answer?._id || `answer-${index}`}
                      className={`bg-white rounded-2xl shadow-sm border ${cardBorderClass} p-6 transition-all hover:shadow-md`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 text-primary-700 font-bold text-sm">
                          {questionNumber}
                        </span>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badgeClass}`}
                        >
                          {badgeIcon}
                          {badgeText}
                        </span>
                      </div>

                      <div className="text-gray-900 font-medium text-lg mb-6 leading-relaxed">
                        {questionText}
                      </div>

                      <div className="space-y-3 mb-6">
                        {options.map((option, optIndex) => {
                          const isUserAnswer = !isUnanswered && userAnswerIndex === optIndex;
                          const isCorrectAnswer = correctAnswerIndex === optIndex;

                          let optionClass = "border-gray-200 bg-white hover:bg-gray-50";
                          let icon = (
                            <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-xs text-gray-500 mr-3 flex-shrink-0">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                          );

                          if (isCorrectAnswer) {
                            optionClass = "border-green-500 bg-green-50/50 ring-1 ring-green-500";
                            icon = (
                              <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs mr-3 flex-shrink-0">
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </span>
                            );
                          } else if (isUserAnswer && !isCorrect) {
                            optionClass = "border-red-500 bg-red-50/50 ring-1 ring-red-500";
                            icon = (
                              <span className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs mr-3 flex-shrink-0">
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </span>
                            );
                          }

                          return (
                            <div
                              key={`${answer?.questionId || index}-option-${optIndex}`}
                              className={`relative flex items-center p-4 rounded-xl border transition-all ${optionClass}`}
                            >
                              {icon}
                              <span
                                className={`text-base ${
                                  isCorrectAnswer
                                    ? "font-medium text-green-900"
                                    : isUserAnswer
                                    ? "font-medium text-red-900"
                                    : "text-gray-700"
                                }`}
                              >
                                {option}
                              </span>

                              {isCorrectAnswer && (
                                <span className="absolute right-4 text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                                  Đáp án đúng
                                </span>
                              )}
                              {isUserAnswer && !isCorrect && (
                                <span className="absolute right-4 text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
                                  Bạn chọn
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {(answer?.explanation || question?.explanation) && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                              <svg
                                className="w-5 h-5 text-yellow-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">
                                Giải thích
                              </h4>
                              <p className="text-gray-600 leading-relaxed">
                                {answer?.explanation || question?.explanation}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizResultPage;
