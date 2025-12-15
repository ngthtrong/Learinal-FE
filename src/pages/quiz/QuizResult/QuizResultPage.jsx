import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import Button from "@/components/common/Button";
import { quizAttemptsService, questionSetsService } from "@/services/api";
import { getErrorMessage } from "@/utils/errorHandler";
import { Footer } from "@/components/layout";

// Difficulty weights for scoring - Bloom's Taxonomy (6 levels)
const DIFFICULTY_WEIGHTS = {
  "Ghi nhớ": 1,
  "Hiểu": 1.2,
  "Áp dụng": 1.4,
  "Phân tích": 1.6,
  "Đánh giá": 1.8,
  "Sáng tạo": 2,
  // English fallbacks
  "Remember": 1,
  "Understand": 1.2,
  "Apply": 1.4,
  "Analyze": 1.6,
  "Evaluate": 1.8,
  "Create": 2,
  // Old mappings (backward compatibility)
  "Biết": 1,
  "Vận dụng": 1.4,
  "Vận dụng cao": 1.6,
};

// Difficulty display config - Bloom's Taxonomy (6 levels)
const DIFFICULTY_CONFIG = {
  "Ghi nhớ": { label: "Ghi nhớ", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400", dotColor: "bg-green-500" },
  "Hiểu": { label: "Hiểu", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400", dotColor: "bg-blue-500" },
  "Áp dụng": { label: "Áp dụng", color: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400", dotColor: "bg-cyan-500" },
  "Phân tích": { label: "Phân tích", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400", dotColor: "bg-yellow-500" },
  "Đánh giá": { label: "Đánh giá", color: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400", dotColor: "bg-orange-500" },
  "Sáng tạo": { label: "Sáng tạo", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400", dotColor: "bg-red-500" },
  // English fallbacks
  "Remember": { label: "Ghi nhớ", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400", dotColor: "bg-green-500" },
  "Understand": { label: "Hiểu", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400", dotColor: "bg-blue-500" },
  "Apply": { label: "Áp dụng", color: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400", dotColor: "bg-cyan-500" },
  "Analyze": { label: "Phân tích", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400", dotColor: "bg-yellow-500" },
  "Evaluate": { label: "Đánh giá", color: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400", dotColor: "bg-orange-500" },
  "Create": { label: "Sáng tạo", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400", dotColor: "bg-red-500" },
  // Old mappings (backward compatibility)
  "Biết": { label: "Ghi nhớ", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400", dotColor: "bg-green-500" },
  "Vận dụng": { label: "Áp dụng", color: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400", dotColor: "bg-cyan-500" },
  "Vận dụng cao": { label: "Phân tích", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400", dotColor: "bg-yellow-500" },
};

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

        console.log("🔍 Loading attempt result for attemptId:", attemptId);
        const attemptData = await quizAttemptsService.getAttemptById(attemptId);
        console.log("📊 Attempt data received:", attemptData);
        setAttempt(attemptData);

        // Determine question set information
        let resolvedQuestionSet = null;

        if (attemptData?.questionSet?.questions?.length) {
          console.log("✅ Question set with questions found in attempt data");
          resolvedQuestionSet = attemptData.questionSet;
        } else {
          const questionSetId =
            attemptData?.questionSetId ||
            attemptData?.questionSet?._id ||
            attemptData?.questionSet?.id ||
            attemptData?.setId;

          console.log("🔍 Question set ID:", questionSetId);

          if (questionSetId) {
            try {
              console.log("📥 Fetching question set separately...");
              resolvedQuestionSet = await questionSetsService.getSetById(questionSetId);
              console.log("✅ Question set fetched:", resolvedQuestionSet);
            } catch (fetchErr) {
              console.warn("⚠️ Không thể tải thông tin bộ câu hỏi:", fetchErr);
            }
          }
        }

        if (resolvedQuestionSet) {
          console.log("✅ Setting question set:", resolvedQuestionSet);
          setQuestionSet(resolvedQuestionSet);
        } else {
          console.warn("⚠️ No question set resolved");
        }

        console.log("📊 Final state - Attempt:", attemptData, "QuestionSet:", resolvedQuestionSet);
      } catch (err) {
        console.error("❌ Error loading result:", err);
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
    console.log("🔍 Raw attempt data:", attempt);

    if (Array.isArray(attempt.answers) && attempt.answers.length > 0) {
      console.log("✅ Using attempt.answers:", attempt.answers);
      return attempt.answers;
    }
    if (Array.isArray(attempt.userAnswers) && attempt.userAnswers.length > 0) {
      console.log("✅ Using attempt.userAnswers:", attempt.userAnswers);
      return attempt.userAnswers;
    }
    if (Array.isArray(attempt.result?.answers) && attempt.result.answers.length > 0) {
      console.log("✅ Using attempt.result.answers:", attempt.result.answers);
      return attempt.result.answers;
    }

    console.warn("⚠️ No answers found in attempt data");
    return [];
  }, [attempt]);

  const answersMap = useMemo(() => {
    const map = new Map();
    rawAnswers.forEach((answer) => {
      // Use questionId as primary key (matches BE format like "CN_Q001")
      const key = String(
        answer?.questionId ||
          answer?.question?.questionId ||
          answer?.question?._id ||
          answer?.question?.id ||
          ""
      );
      if (key) {
        map.set(key, answer);
      }
    });
    console.log("📍 Answers map keys:", Array.from(map.keys()));
    return map;
  }, [rawAnswers]);

  const enrichedAnswers = useMemo(() => {
    console.log("🔍 Building enriched answers...");
    console.log("Question set:", questionSet);
    console.log("Answers map:", answersMap);

    if (questionSet?.questions?.length) {
      console.log("✅ Using question set questions:", questionSet.questions.length, "questions");
      return questionSet.questions.map((question, index) => {
        // Use questionId as primary key to match BE format (e.g., "CN_Q001")
        const questionKey = String(
          question?.questionId || question?._id || question?.id || `q-${index}`
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

        console.log(`Question ${index + 1}:`, {
          questionKey,
          selectedOptionIndex,
          correctAnswerIndex,
          isCorrect,
          hasBaseAnswer: !!Object.keys(baseAnswer).length,
        });

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
    let weightedScore = 0;
    let maxWeightedScore = 0;

    // Count by difficulty - Bloom's Taxonomy (6 levels)
    const difficultyStats = {
      "Ghi nhớ": { correct: 0, total: 0 },
      "Hiểu": { correct: 0, total: 0 },
      "Áp dụng": { correct: 0, total: 0 },
      "Phân tích": { correct: 0, total: 0 },
      "Đánh giá": { correct: 0, total: 0 },
      "Sáng tạo": { correct: 0, total: 0 },
    };

    enrichedAnswers.forEach((answer) => {
      const question = answer?.question || {};
      const difficultyLevel = question?.difficultyLevel || question?.difficulty || "Hiểu";
      const weight = DIFFICULTY_WEIGHTS[difficultyLevel] || 1;
      
      // Map to Vietnamese if needed
      const normalizedDifficulty = DIFFICULTY_CONFIG[difficultyLevel]?.label || "Hiểu";
      if (difficultyStats[normalizedDifficulty]) {
        difficultyStats[normalizedDifficulty].total += 1;
      }
      
      maxWeightedScore += weight;
      
      const selected = answer?.selectedOptionIndex;
      if (selected === undefined || selected === null || selected === -1) {
        unansweredCount += 1;
        return;
      }

      if (answer?.isCorrect === true) {
        correctCount += 1;
        weightedScore += weight;
        if (difficultyStats[normalizedDifficulty]) {
          difficultyStats[normalizedDifficulty].correct += 1;
        }
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
      weightedScore: Math.round(weightedScore * 10) / 10,
      maxWeightedScore: Math.round(maxWeightedScore * 10) / 10,
      difficultyStats,
    };
  }, [enrichedAnswers, questionSet, attempt]);

  const filteredQuestions = useMemo(() => {
    switch (filter) {
      case "correct":
        return enrichedAnswers.filter((answer) => answer?.isCorrect === true);
      case "incorrect":
        return enrichedAnswers.filter((answer) => {
          const selected = answer?.selectedOptionIndex;
          const hasAnswered = selected !== undefined && selected !== null && selected !== -1;
          // Show questions where user answered but got it wrong (isCorrect === false OR couldn't determine but user answered)
          return hasAnswered && answer?.isCorrect !== true;
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Đang tải kết quả...</p>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Đã xảy ra lỗi
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || "Không tìm thấy kết quả bài thi"}
          </p>
          <Button onClick={() => navigate("/quiz")} className="w-full justify-center">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const scorePercentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  const weightedPercentage = stats.maxWeightedScore > 0 
    ? Math.round((stats.weightedScore / stats.maxWeightedScore) * 100) 
    : 0;
  const scoreValue =
    attempt?.score !== undefined && attempt?.score !== null ? attempt.score : stats.weightedScore;
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

  const scoreColorClass = getScoreColor(weightedPercentage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:to-gray-900 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-lg sm:text-xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
            Kết quả bài thi
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
            {questionSet?.title ||
              attempt?.questionSet?.title ||
              attempt?.questionSet?.name ||
              "Chi tiết kết quả"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 py-4 sm:py-6 lg:py-10">
          {/* Left Column: Score Summary (Sticky on Desktop) */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 sticky top-8">
              <div className="flex flex-col items-center mb-4 sm:mb-6 lg:mb-8">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mb-3 sm:mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-100 dark:text-gray-700 stroke-current"
                      strokeWidth="8"
                      fill="none"
                      cx="50"
                      cy="50"
                      r="40"
                    />
                    <circle
                      className={`${scoreColorClass} transition-all duration-1000 ease-out`}
                      strokeWidth="8"
                      strokeDasharray={`${weightedPercentage * 2.51} 251`}
                      strokeLinecap="round"
                      fill="none"
                      cx="50"
                      cy="50"
                      r="40"
                    />
                  </svg>
                  <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                    <span className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${scoreColorClass.split(" ")[0]}`}>
                      {stats.correct}
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
                      / {stats.total}
                    </span>
                    <span className="text-[10px] sm:text-xs lg:text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mt-0.5 sm:mt-1">
                      Câu đúng
                    </span>
                  </div>
                </div>

                <div className="text-center space-y-1 sm:space-y-2">
                  <div>
                    <div className="text-[10px] sm:text-xs font-medium text-gray-400 dark:text-gray-500">
                      Tỷ lệ chính xác
                    </div>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {scorePercentage}%
                    </div>
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    (Điểm trọng số: {formattedScore}/{stats.maxWeightedScore} = {weightedPercentage}%)
                  </div>
                </div>
              </div>

              {/* Difficulty breakdown */}
              <div className="mb-4 sm:mb-6 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2">Phân bổ theo độ khó</div>
                <div className="space-y-1.5 sm:space-y-2">
                  {Object.entries(stats.difficultyStats).map(([level, data]) => {
                    if (data.total === 0) return null;
                    const config = DIFFICULTY_CONFIG[level] || {};
                    const weight = DIFFICULTY_WEIGHTS[level] || 1;
                    return (
                      <div key={level} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${config.dotColor || 'bg-gray-400'}`}></div>
                          <span className="text-gray-600 dark:text-gray-400">{level}</span>
                          <span className="text-gray-400 dark:text-gray-500">(×{weight})</span>
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {data.correct}/{data.total}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 sm:space-y-4 mb-4 sm:mb-8">
                <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Tổng số câu</span>
                  <span className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                  <span className="flex items-center text-xs sm:text-sm text-green-700 dark:text-green-400">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2"
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
                  <span className="font-bold text-sm sm:text-base text-green-700 dark:text-green-400">{stats.correct}</span>
                </div>
                <div className="flex justify-between items-center p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                  <span className="flex items-center text-xs sm:text-sm text-red-700 dark:text-red-400">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2"
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
                  <span className="font-bold text-sm sm:text-base text-red-700 dark:text-red-400">{stats.incorrect}</span>
                </div>
                <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <span className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2"
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
                  <span className="font-bold text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    {stats.unanswered}
                  </span>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Button
                  onClick={handleRetry}
                  className="w-full justify-center py-2 sm:py-3 text-sm sm:text-base shadow-md hover:shadow-lg transition-all"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2"
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
                  className="w-full justify-center py-2 sm:py-3 text-sm sm:text-base"
                >
                  Về trang chủ
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Review */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-1.5 sm:p-2 mb-4 sm:mb-6 flex overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setFilter("all")}
                className={`flex-1 min-w-[80px] sm:min-w-[100px] py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  filter === "all"
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                Tất cả ({stats.total})
              </button>
              <button
                onClick={() => setFilter("correct")}
                className={`flex-1 min-w-[80px] sm:min-w-[100px] py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  filter === "correct"
                    ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                Đúng ({stats.correct})
              </button>
              <button
                onClick={() => setFilter("incorrect")}
                className={`flex-1 min-w-[80px] sm:min-w-[100px] py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  filter === "incorrect"
                    ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                Sai ({stats.incorrect})
              </button>
            </div>

            {/* Questions List */}
            <div className="space-y-4 sm:space-y-6">
              {filteredQuestions.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
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
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    Không có câu hỏi nào trong mục này
                  </p>
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
                  
                  // Get difficulty info
                  const difficultyLevel = question?.difficultyLevel || question?.difficulty || "Hiểu";
                  const difficultyConfig = DIFFICULTY_CONFIG[difficultyLevel] || DIFFICULTY_CONFIG["Hiểu"];
                  const difficultyWeight = DIFFICULTY_WEIGHTS[difficultyLevel] || 1;

                  // Determine card styling based on status
                  let cardBorderClass = "border-gray-100 dark:border-gray-700";
                  let badgeClass = "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";
                  let badgeIcon = null;
                  let badgeText = "Chưa trả lời";

                  if (isCorrect) {
                    cardBorderClass = "border-green-200 dark:border-green-800 ring-1 ring-green-50 dark:ring-green-900/30";
                    badgeClass = "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
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
                    badgeText = `Đúng (+${difficultyWeight} điểm)`;
                  } else if (!isUnanswered) {
                    cardBorderClass = "border-red-200 dark:border-red-800 ring-1 ring-red-50 dark:ring-red-900/30";
                    badgeClass = "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
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
                      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border ${cardBorderClass} p-6 transition-all hover:shadow-md`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-bold text-sm">
                            {questionNumber}
                          </span>
                          {/* Difficulty Tag */}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${difficultyConfig.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${difficultyConfig.dotColor}`}></span>
                            {difficultyConfig.label}
                            <span className="text-gray-400 dark:text-gray-500 font-normal">(×{difficultyWeight})</span>
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badgeClass}`}
                        >
                          {badgeIcon}
                          {badgeText}
                        </span>
                      </div>

                      <div className="text-gray-900 dark:text-gray-100 font-medium text-lg mb-6 leading-relaxed">
                        {questionText}
                      </div>

                      <div className="space-y-3 mb-6">
                        {options.map((option, optIndex) => {
                          const isUserAnswer = !isUnanswered && userAnswerIndex === optIndex;
                          const isCorrectAnswer = correctAnswerIndex === optIndex;

                          let optionClass =
                            "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700";
                          let icon = (
                            <span className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                          );

                          if (isCorrectAnswer) {
                            optionClass = "border-green-500 dark:border-green-600 bg-green-50/50 dark:bg-green-900/20 ring-1 ring-green-500 dark:ring-green-600";
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
                            optionClass = "border-red-500 dark:border-red-600 bg-red-50/50 dark:bg-red-900/20 ring-1 ring-red-500 dark:ring-red-600";
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
                                    ? "font-medium text-green-900 dark:text-green-300"
                                    : isUserAnswer
                                    ? "font-medium text-red-900 dark:text-red-300"
                                    : "text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {option}
                              </span>

                              {isCorrectAnswer && (
                                <span className="absolute right-4 text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded">
                                  Đáp án đúng
                                </span>
                              )}
                              {isUserAnswer && !isCorrect && (
                                <span className="absolute right-4 text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded">
                                  Bạn chọn
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {(answer?.explanation || question?.explanation) && (
                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mr-3">
                              <svg
                                className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
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
                              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-1">
                                Giải thích
                              </h4>
                              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
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

      {/* Footer */}
      <Footer className="mt-12" />
    </div>
  );
}

export default QuizResultPage;
