/**
 * Expert Quiz Start Page Wrapper
 * Wraps QuizStartPage but overrides navigation to use expert routes
 */
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import quizAttemptsService from "@/services/api/quizAttempts.service";
import questionSetsService from "@/services/api/questionSets.service";
import Button from "@/components/common/Button";
import { useToast } from "@/components/common";
import { useActiveQuiz } from "@/contexts/ActiveQuizContext";

function ExpertQuizStartPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { startQuizTimer } = useActiveQuiz();
  const [questionSet, setQuestionSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!id || id === 'undefined') {
      toast.showError("ID bộ đề không hợp lệ");
      navigate('/expert/question-sets');
      return;
    }
    fetchQuestionSet();
  }, [id]);

  const fetchQuestionSet = async () => {
    try {
      setLoading(true);
      console.log("Fetching question set with id:", id);
      const response = await questionSetsService.getSetById(id);
      console.log("Question set response:", response);
      const data = response?.data || response;
      setQuestionSet(data);
    } catch (err) {
      console.error("Failed to fetch question set:", err);
      toast.showError(err?.response?.data?.message || "Không thể tải bộ đề");
      setTimeout(() => navigate('/expert/question-sets'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    try {
      console.log("Starting quiz with id:", id);
      if (!id || id === 'undefined') {
        toast.showError("ID bộ đề không hợp lệ");
        navigate('/expert/question-sets');
        return;
      }

      setStarting(true);
      const settings = location.state || {};
      console.log("Creating attempt with settings:", { setId: id, ...settings });
      
      const attemptData = await quizAttemptsService.createAttempt({
        setId: id,
        startTime: new Date().toISOString(),
        ...settings,
      });
      
      console.log("Attempt created:", attemptData);
      
      // Start background timer tracking if timed quiz
      const attemptId = attemptData?.data?.id || attemptData?.id;
      if (settings.isTimed && settings.timerMinutes) {
        startQuizTimer(
          attemptId,
          settings.timerMinutes,
          attemptData?.startTime || new Date().toISOString(),
          questionSet?.title || "Expert Quiz"
        );
      }
      
      // Navigate to expert quiz taking page
      if (!attemptId) {
        throw new Error("Không nhận được ID của bài làm");
      }
      
      console.log("Navigating to quiz take page with attemptId:", attemptId);
      navigate(`/expert/quiz/take/${attemptId}`, {
        state: {
          questionSetId: id,
          attemptId: attemptId,
          settings,
        },
      });
    } catch (err) {
      console.error("Start quiz error:", err);
      toast.showError(err?.response?.data?.message || "Không thể bắt đầu làm bài");
      navigate('/expert/question-sets');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!questionSet) return null;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 py-6 sm:py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 sm:p-6 lg:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-3 sm:mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-8 sm:h-8">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {questionSet.title}
            </h1>
            {questionSet.description && (
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">{questionSet.description}</p>
            )}
            <div className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
              👨‍🏫 Chế độ Expert - Làm bài thử
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Thông tin bài thi</h2>
            <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Số câu hỏi:</span>
                <span className="font-medium text-gray-900">
                  {questionSet.questionCount || questionSet.questions?.length || 0} câu
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Trạng thái:</span>
                <span className="font-medium text-gray-900">
                  {questionSet.status === "Draft" ? "Bản nháp" : "Công khai"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex gap-2 sm:gap-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium mb-1">Lưu ý:</p>
                <ul className="list-disc list-inside space-y-0.5 sm:space-y-1">
                  <li>Đây là chế độ làm bài thử dành cho Expert</li>
                  <li>Kết quả sẽ được lưu lại để bạn xem lại</li>
                  <li>Bạn có thể làm lại bài nhiều lần</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              variant="secondary"
              onClick={() => navigate(`/expert/question-sets/${id}`)}
              disabled={starting}
              className="w-full sm:flex-1 order-2 sm:order-1"
            >
              Quay lại
            </Button>
            <Button
              onClick={handleStartQuiz}
              disabled={starting}
              className="w-full sm:flex-1 order-1 sm:order-2"
            >
              {starting ? "Đang bắt đầu..." : "Bắt đầu làm bài"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpertQuizStartPage;
