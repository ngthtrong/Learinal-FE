/**
 * Active Quiz Context
 * Manages background timer for active quiz attempts
 * Auto-submits when time expires, regardless of which page user is on
 */

import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import quizAttemptsService from "@/services/api/quizAttempts.service";
import { useToast } from "@/components/common";

const ActiveQuizContext = createContext(null);

const STORAGE_KEY = "activeQuizAttempt";

export function ActiveQuizProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  // Active quiz state
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);
  
  const timerRef = useRef(null);
  const autoSubmitRef = useRef(false);

  // Load active quiz from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        // Verify the quiz is still valid (not expired)
        if (data.attemptId && data.endTime) {
          const remaining = Math.floor((new Date(data.endTime).getTime() - Date.now()) / 1000);
          if (remaining > 0) {
            setActiveQuiz(data);
            setTimeRemaining(remaining);
          } else {
            // Time already expired - trigger auto submit
            setActiveQuiz(data);
            setTimeRemaining(0);
          }
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Start tracking a quiz
  const startQuizTimer = useCallback((attemptId, timerMinutes, startTime, questionSetTitle) => {
    const startTimestamp = new Date(startTime).getTime();
    const endTime = new Date(startTimestamp + timerMinutes * 60 * 1000);
    
    const quizData = {
      attemptId,
      timerMinutes,
      startTime,
      endTime: endTime.toISOString(),
      questionSetTitle,
    };
    
    setActiveQuiz(quizData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quizData));
    
    const remaining = Math.floor((endTime.getTime() - Date.now()) / 1000);
    setTimeRemaining(Math.max(0, remaining));
    
    console.log("[ActiveQuizContext] Started tracking quiz:", quizData);
  }, []);

  // Stop tracking (after submit or cancel)
  const clearActiveQuiz = useCallback(() => {
    setActiveQuiz(null);
    setTimeRemaining(null);
    autoSubmitRef.current = false;
    localStorage.removeItem(STORAGE_KEY);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    console.log("[ActiveQuizContext] Cleared active quiz");
  }, []);

  // Auto-submit function
  const autoSubmit = useCallback(async () => {
    if (!activeQuiz || autoSubmitRef.current || isAutoSubmitting) return;
    
    autoSubmitRef.current = true;
    setIsAutoSubmitting(true);
    
    console.log("[ActiveQuizContext] Auto-submitting quiz:", activeQuiz.attemptId);
    
    try {
      // First, get the current attempt to retrieve saved answers
      const attempt = await quizAttemptsService.getAttemptById(activeQuiz.attemptId);
      
      // Check if already completed
      if (attempt.isCompleted) {
        console.log("[ActiveQuizContext] Quiz already completed");
        clearActiveQuiz();
        return;
      }
      
      // Prepare answers from saved data
      const answers = (attempt.userAnswers || [])
        .filter(a => a.selectedOptionIndex !== undefined && a.selectedOptionIndex !== -1)
        .map(a => ({
          questionId: String(a.questionId),
          selectedOptionIndex: a.selectedOptionIndex,
        }));
      
      // Submit the attempt
      await quizAttemptsService.submitAttempt(activeQuiz.attemptId, { answers });
      
      // Show notification
      toast.showWarning(`Hết thời gian! Bài thi "${activeQuiz.questionSetTitle}" đã được tự động nộp.`);
      
      // Check if user is currently on the quiz taking page
      const isOnQuizPage = location.pathname.includes(`/quiz/take/${activeQuiz.attemptId}`);
      
      // Clear the active quiz
      const attemptId = activeQuiz.attemptId;
      clearActiveQuiz();
      
      // Navigate to result page if not already there
      if (!location.pathname.includes(`/quiz/result/${attemptId}`)) {
        navigate(`/quiz/result/${attemptId}`, { replace: isOnQuizPage });
      }
      
    } catch (err) {
      console.error("[ActiveQuizContext] Auto-submit failed:", err);
      toast.showError("Không thể tự động nộp bài. Vui lòng nộp bài thủ công.");
      autoSubmitRef.current = false;
    } finally {
      setIsAutoSubmitting(false);
    }
  }, [activeQuiz, isAutoSubmitting, clearActiveQuiz, navigate, location.pathname, toast]);

  // Timer countdown effect
  useEffect(() => {
    if (activeQuiz && timeRemaining !== null) {
      // Time expired - auto submit
      if (timeRemaining <= 0) {
        autoSubmit();
        return;
      }
      
      // Start countdown
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [activeQuiz, timeRemaining, autoSubmit]);

  // Handle visibility change (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && activeQuiz) {
        // Recalculate time remaining when tab becomes visible
        const remaining = Math.floor(
          (new Date(activeQuiz.endTime).getTime() - Date.now()) / 1000
        );
        setTimeRemaining(Math.max(0, remaining));
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [activeQuiz]);

  // Check if there's an active quiz for a specific attempt
  const isActiveQuiz = useCallback((attemptId) => {
    return activeQuiz?.attemptId === attemptId;
  }, [activeQuiz]);

  const value = {
    activeQuiz,
    timeRemaining,
    isAutoSubmitting,
    startQuizTimer,
    clearActiveQuiz,
    isActiveQuiz,
  };

  return (
    <ActiveQuizContext.Provider value={value}>
      {children}
    </ActiveQuizContext.Provider>
  );
}

export function useActiveQuiz() {
  const context = useContext(ActiveQuizContext);
  if (!context) {
    throw new Error("useActiveQuiz must be used within an ActiveQuizProvider");
  }
  return context;
}

export default ActiveQuizContext;
