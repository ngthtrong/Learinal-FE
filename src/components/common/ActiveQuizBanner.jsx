/**
 * Active Quiz Banner
 * Shows a floating banner when there's an active timed quiz
 * Allows user to return to the quiz or see remaining time
 */

import { useActiveQuiz } from "@/contexts/ActiveQuizContext";
import { useNavigate, useLocation } from "react-router-dom";

function ActiveQuizBanner() {
  const { activeQuiz, timeRemaining, isAutoSubmitting } = useActiveQuiz();
  const navigate = useNavigate();
  const location = useLocation();

  // Only show on learner pages (not admin, expert, login, register, etc.)
  const learnerPaths = ['/home', '/dashboard', '/documents', '/quiz', '/public', '/profile', '/subjects', '/question-sets', '/subscriptions', '/mysubscription', '/addon-packages', '/notifications'];
  const isLearnerPage = learnerPaths.some(path => location.pathname.startsWith(path));

  // Don't show if no active quiz, not on learner page, or already on quiz taking page
  if (!activeQuiz || !isLearnerPage || location.pathname.includes(`/quiz/take/${activeQuiz.attemptId}`)) {
    return null;
  }

  // Format time remaining
  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isWarning = timeRemaining !== null && timeRemaining <= 60;
  const isCritical = timeRemaining !== null && timeRemaining <= 30;

  const handleReturnToQuiz = () => {
    navigate(`/quiz/take/${activeQuiz.attemptId}`);
  };

  return (
    <div 
      className={`fixed top-16 left-1/2 transform -translate-x-1/2 z-50 shadow-lg rounded-lg px-4 py-3 flex items-center gap-3 transition-all ${
        isCritical 
          ? "bg-red-600 text-white animate-pulse" 
          : isWarning 
            ? "bg-amber-500 text-white" 
            : "bg-primary-600 text-white"
      }`}
    >
      {/* Timer icon */}
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={isCritical ? "animate-bounce" : ""}
      >
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>

      {/* Quiz info */}
      <div className="flex flex-col">
        <span className="text-xs opacity-90">Đang làm bài:</span>
        <span className="font-medium text-sm truncate max-w-[150px] sm:max-w-[250px]">
          {activeQuiz.questionSetTitle}
        </span>
      </div>

      {/* Time remaining */}
      <div className={`font-bold text-lg tabular-nums ${isCritical ? "text-white" : ""}`}>
        {isAutoSubmitting ? "Đang nộp..." : formatTime(timeRemaining)}
      </div>

      {/* Return button */}
      {!isAutoSubmitting && (
        <button
          onClick={handleReturnToQuiz}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            isCritical 
              ? "bg-white text-red-600 hover:bg-red-100" 
              : isWarning 
                ? "bg-white text-amber-600 hover:bg-amber-100" 
                : "bg-white text-primary-600 hover:bg-primary-100"
          }`}
        >
          Quay lại
        </button>
      )}
    </div>
  );
}

export default ActiveQuizBanner;
