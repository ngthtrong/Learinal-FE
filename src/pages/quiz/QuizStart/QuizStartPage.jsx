/**
 * Quiz Start Page
 * Configure quiz settings before starting (timer, shuffle, etc.)
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import questionSetsService from "@/services/api/questionSets.service";
import quizAttemptsService from "@/services/api/quizAttempts.service";
import Button from "@/components/common/Button";
import { useToast } from "@/components/common";
import { getErrorMessage } from "@/utils/errorHandler";

function QuizStartPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [questionSet, setQuestionSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

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
    try {
      setStarting(true);

      // Create quiz attempt
      const attempt = await quizAttemptsService.createAttempt({
        setId: id,
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="inline-block w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!questionSet) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-6">
          <Button variant="secondary" onClick={() => navigate(`/question-sets/${id}`)}>
            ← Quay lại
          </Button>
        </div>

        {/* Quiz Info */}
        <div className="bg-white rounded-xl shadow-medium p-8 text-center mb-6">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{questionSet.title}</h1>
          {questionSet.description && (
            <p className="text-gray-600 mb-6">{questionSet.description}</p>
          )}

          <div className="flex items-center justify-center gap-8 mt-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <span className="text-gray-700">
                <strong className="text-gray-900">
                  {questionSet.questionCount || questionSet.questions?.length || 0}
                </strong>{" "}
                câu hỏi
              </span>
            </div>
            {useTimer && (
              <div className="flex items-center gap-2">
                <span className="text-2xl">⏱️</span>
                <span className="text-gray-700">
                  <strong className="text-gray-900">{timerMinutes}</strong> phút
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl shadow-medium p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">⚙️ Cài đặt bài thi</h2>

          {/* Timer Setting */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={useTimer}
                onChange={(e) => setUseTimer(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 mt-0.5"
              />
              <div className="flex-1">
                <span className="text-lg font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                  ⏱️ Sử dụng bộ đếm thời gian
                </span>
              </div>
            </label>

            {useTimer && (
              <div className="mt-4 ml-8 space-y-4">
                <div className="flex items-center gap-4">
                  <label htmlFor="timer-minutes" className="text-sm font-medium text-gray-700">
                    Thời gian (phút):
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTimerMinutes(Math.max(10, timerMinutes - 10))}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700 transition-colors"
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
                      className="w-20 px-3 py-2 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-bold text-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setTimerMinutes(Math.min(180, timerMinutes + 10))}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-warning-50 border border-warning-200 rounded-lg p-3">
                  <span className="text-warning-600 text-lg">⚠️</span>
                  <p className="text-sm text-warning-800">
                    Hết thời gian sẽ tự động nộp bài. Đảm bảo bạn có đủ thời gian để hoàn thành.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Shuffle Setting */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 mt-0.5"
              />
              <div className="flex-1">
                <div className="text-lg font-medium text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
                  🔀 Xáo trộn câu hỏi
                </div>
                <p className="text-sm text-gray-600">
                  Các câu hỏi sẽ xuất hiện theo thứ tự ngẫu nhiên
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-primary-900 mb-4">📋 Hướng dẫn</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-gray-700">
              <span className="text-primary-600 font-bold">•</span>
              <span>Đọc kỹ từng câu hỏi trước khi chọn đáp án</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700">
              <span className="text-primary-600 font-bold">•</span>
              <span>Chỉ có thể chọn một đáp án cho mỗi câu hỏi</span>
            </li>
            <li className="flex items-start gap-3 text-gray-700">
              <span className="text-primary-600 font-bold">•</span>
              <span>Có thể xem lại và thay đổi câu trả lời trước khi nộp bài</span>
            </li>
            {useTimer && (
              <li className="flex items-start gap-3 text-gray-700">
                <span className="text-warning-600 font-bold">•</span>
                <strong className="text-warning-800">
                  Khi hết thời gian, bài thi sẽ tự động được nộp
                </strong>
              </li>
            )}
            <li className="flex items-start gap-3 text-gray-700">
              <span className="text-primary-600 font-bold">•</span>
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
            disabled={starting}
          >
            {starting ? "Đang khởi tạo..." : "🚀 Bắt đầu làm bài"}
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 text-sm">© 2025 Learinal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default QuizStartPage;
