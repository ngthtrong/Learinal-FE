import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import questionSetsService from "@/services/api/questionSets.service";
import quizAttemptsService from "@/services/api/quizAttempts.service";
import Button from "@/components/common/Button";
import { useToast, PremiumRequiredModal, ReportContentModal } from "@/components/common";
import { getErrorMessage } from "@/utils/errorHandler";
import { Footer } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";

function QuizStartPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [questionSet, setQuestionSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Quiz settings
  const [useTimer, setUseTimer] = useState(true);
  const [timerMinutes, setTimerMinutes] = useState(60);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);

  useEffect(() => {
    fetchQuestionSet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchQuestionSet = async () => {
    try {
      setLoading(true);
      const data = await questionSetsService.getSetById(id);
      setQuestionSet(data);
      
      // Check if this is a premium-required expert set
      if (data._premiumRequired) {
        setShowPremiumModal(true);
      }
      
      // Set default timer based on question count (2 minutes per question)
      const questionCount = data.questionCount || data.questions?.length || 10;
      const defaultTime = Math.max(30, Math.min(120, questionCount * 2));
      setTimerMinutes(defaultTime);
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
      setTimeout(() => navigate(`/question-sets/${id}`), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    // Check premium requirement before starting quiz
    if (questionSet?._premiumRequired) {
      setShowPremiumModal(true);
      return;
    }

    try {
      setStarting(true);

      // Create quiz attempt
      const attempt = await quizAttemptsService.createAttempt({
        setId: id,
        isTimed: useTimer,
      });

      toast.showSuccess("Bắt đầu làm bài!");

      // Navigate to quiz taking page with settings
      navigate(`/quiz/take/${attempt.id}`, {
        state: {
          useTimer,
          timerMinutes,
          shuffleQuestions,
          questionSet,
        },
      });
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="inline-block w-12 h-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!questionSet) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:to-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <Button variant="secondary" onClick={() => navigate(`/question-sets/${id}`)} className="text-sm sm:text-base">
            ← Quay lại
          </Button>
          
          {/* Report button for expert content - only show if user has premium access */}
          {questionSet?.creatorRole === 'Expert' && user?.currentSubscription?.status === 'Active' && (
            <Button 
              variant="secondary" 
              onClick={() => setShowReportModal(true)}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border-red-300 hover:border-red-400"
            >
              <span className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Báo cáo vấn đề
              </span>
            </Button>
          )}
        </div>

        {/* Quiz Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-medium border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8 text-center mb-4 sm:mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 flex items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/30">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-12 sm:h-12 text-primary-600 dark:text-primary-400"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            {questionSet.title}
          </h1>
          {questionSet.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-6">{questionSet.description}</p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-6">
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-gray-100">
                  {questionSet.questionCount || questionSet.questions?.length || 0}
                </strong>{" "}
                câu hỏi
              </span>
            </div>
            {useTimer && (
              <div className="flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                  <strong className="text-gray-900 dark:text-gray-100">{timerMinutes}</strong> phút
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-medium border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6m5.657-13.657l-4.243 4.243m-4.243 0L4.93 4.343m12.728 0l-4.242 4.243m-4.243 0L4.93 19.657"></path></svg>
            Cài đặt bài thi
          </h2>

          {/* Timer Setting */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4 sm:pb-6 mb-4 sm:mb-6">
            <label className="flex items-start gap-2 sm:gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={useTimer}
                onChange={(e) => setUseTimer(e.target.checked)}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 mt-0.5"
              />
              <div className="flex-1">
                <span className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Sử dụng bộ đếm thời gian
                </span>
              </div>
            </label>

            {useTimer && (
              <div className="mt-3 sm:mt-4 ml-6 sm:ml-8 space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <label
                    htmlFor="timer-minutes"
                    className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Thời gian (phút):
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTimerMinutes(Math.max(10, timerMinutes - 10))}
                      className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-bold text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      −
                    </button>
                    <input
                      id="timer-minutes"
                      type="number"
                      min="10"
                      max="180"
                      value={timerMinutes}
                      onChange={(e) =>
                        setTimerMinutes(Math.max(10, parseInt(e.target.value) || 10))
                      }
                      className="w-16 sm:w-20 px-2 sm:px-3 py-1.5 sm:py-2 text-center border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-bold text-base sm:text-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setTimerMinutes(Math.min(180, timerMinutes + 10))}
                      className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-bold text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-warning-50 dark:bg-yellow-900/20 border border-warning-200 dark:border-yellow-800 rounded-lg p-2 sm:p-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[18px] sm:h-[18px] text-warning-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  <p className="text-xs sm:text-sm text-warning-800 dark:text-yellow-300">
                    Hết thời gian sẽ tự động nộp bài. Đảm bảo bạn có đủ thời gian để hoàn thành.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Shuffle Setting */}
          <div>
            <label className="flex items-start gap-2 sm:gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 mt-0.5"
              />
              <div className="flex-1">
                <div className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-1 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[18px] sm:h-[18px]"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
                  Xáo trộn câu hỏi
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Các câu hỏi sẽ xuất hiện theo thứ tự ngẫu nhiên
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-bold text-primary-900 dark:text-primary-300 mb-3 sm:mb-4 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Hướng dẫn
          </h3>
          <ul className="space-y-2 sm:space-y-3">
            <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
              <span className="text-primary-600 dark:text-primary-400 font-bold">•</span>
              <span>Đọc kỹ từng câu hỏi trước khi chọn đáp án</span>
            </li>
            <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
              <span className="text-primary-600 dark:text-primary-400 font-bold">•</span>
              <span>Chỉ có thể chọn một đáp án cho mỗi câu hỏi</span>
            </li>
            <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
              <span className="text-primary-600 dark:text-primary-400 font-bold">•</span>
              <span>Có thể xem lại và thay đổi câu trả lời trước khi nộp bài</span>
            </li>
            {useTimer && (
              <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                <span className="text-warning-600 dark:text-yellow-500 font-bold">•</span>
                <strong className="text-warning-800 dark:text-yellow-300">
                  Khi hết thời gian, bài thi sẽ tỷ động được nộp
                </strong>
              </li>
            )}
            <li className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300">
              <span className="text-primary-600 dark:text-primary-400 font-bold">•</span>
              <span>Sau khi nộp bài, bạn sẽ xem được kết quả và đáp án chi tiết</span>
            </li>
          </ul>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <Button
            variant="primary"
            size="large"
            onClick={handleStartQuiz}
            loading={starting}
            disabled={starting || questionSet?._premiumRequired}
          >
            {starting ? (
              "Đang khởi tạo..."
            ) : (
              <span className="inline-flex items-center gap-2 ">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>
                {questionSet?._premiumRequired ? "Yêu cầu Premium" : "Bắt đầu làm bài"}
              </span>
            )}
          </Button>
          
          {/* Premium notice */}
          {questionSet?._premiumRequired && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
              </svg>
              {questionSet._message || "Bạn cần nâng cấp lên gói Premium để làm bài tập này"}
            </div>
          )}
        </div>
      </div>

      {/* Premium Required Modal */}
      {showPremiumModal && (
        <PremiumRequiredModal 
          onClose={() => setShowPremiumModal(false)}
          onUpgrade={() => {
            setShowPremiumModal(false);
            navigate("/subscriptions/plans");
          }}
          title={questionSet?.title}
        />
      )}

      {/* Report Content Modal */}
      <ReportContentModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentType="QuestionSet"
        contentId={id}
        contentTitle={questionSet?.title}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default QuizStartPage;
