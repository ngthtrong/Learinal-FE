/**
 * QuizResultPage Component
 * Display quiz results with detailed answers and explanations
 */

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import Button from "@/components/common/Button";
import { quizAttemptsService, questionSetsService } from "@/services/api";
import { getErrorMessage } from "@/utils/errorHandler";
import "./QuizResultPage.css";

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

  const scorePercentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  const scoreValue =
    attempt?.score !== undefined && attempt?.score !== null ? attempt.score : stats.correct;
  const formattedScore =
    typeof scoreValue === "number"
      ? Number.isInteger(scoreValue)
        ? scoreValue
        : scoreValue.toFixed(1)
      : scoreValue || 0;

  return (
    <div className="quiz-result-page">
      {/* Header */}
      <div className="result-header">
        <h1>Kết quả bài thi</h1>
        <p className="quiz-name">
          {questionSet?.title || attempt?.questionSet?.title || attempt?.questionSet?.name || ""}
        </p>
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
            <span className="score-number">{formattedScore}</span>
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
            const question = answer?.question || {};
            const userAnswerIndex = answer?.selectedOptionIndex;
            const correctAnswerIndex = answer?.correctAnswerIndex ?? question?.correctAnswerIndex;
            const isCorrect = answer?.isCorrect === true;
            const isUnanswered =
              userAnswerIndex === undefined || userAnswerIndex === null || userAnswerIndex === -1;

            const questionNumber = (answer?.index ?? index) + 1;
            const questionText =
              question?.questionText ||
              question?.content ||
              answer?.questionText ||
              "Không tìm thấy nội dung câu hỏi";
            const options = question?.options || answer?.options || [];

            const itemStatusClass = isUnanswered
              ? "unanswered"
              : isCorrect
              ? "correct"
              : "incorrect";
            const badgeLabel = isUnanswered ? "○ Chưa trả lời" : isCorrect ? "✓ Đúng" : "✗ Sai";

            return (
              <div
                key={answer?.questionId || answer?._id || `answer-${index}`}
                className={`question-item ${itemStatusClass}`}
              >
                <div className="question-item-header">
                  <span className="question-number">Câu {questionNumber}</span>
                  <span className={`result-badge ${itemStatusClass}`}>{badgeLabel}</span>
                </div>

                <div className="question-text">{questionText}</div>

                <div className="answers-review">
                  {options.map((option, optIndex) => {
                    const isUserAnswer = !isUnanswered && userAnswerIndex === optIndex;
                    const isCorrectAnswer = correctAnswerIndex === optIndex;

                    let answerClass = "";
                    if (isCorrectAnswer) {
                      answerClass = "correct-answer";
                    } else if (isUserAnswer && !isCorrect) {
                      answerClass = "wrong-answer";
                    }

                    return (
                      <div
                        key={`${answer?.questionId || index}-option-${optIndex}`}
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

                {isUnanswered && (
                  <div className="unanswered-message">Bạn chưa chọn đáp án cho câu hỏi này.</div>
                )}

                {/* Explanation */}
                {(answer?.explanation || question?.explanation) && (
                  <div className="explanation">
                    <strong>💡 Lời giải:</strong>
                    <p>{answer?.explanation || question?.explanation}</p>
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
