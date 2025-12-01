/**
 * Expert Question Set Detail Page
 * Xem chi tiết bộ đề của expert với danh sách câu hỏi
 */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, useToast } from "@/components/common";
import questionSetsService from "@/services/api/questionSets.service";
import { formatDate } from "@/utils/formatters";

function ExpertQuestionSetDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showError, showSuccess } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [questionSet, setQuestionSet] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    console.log("ExpertQuestionSetDetailPage - id from params:", id);
    if (!id || id === 'undefined') {
      showError("ID bộ đề không hợp lệ");
      navigate("/expert/question-sets");
      return;
    }
    fetchQuestionSet();
  }, [id]);

  const fetchQuestionSet = async () => {
    try {
      setLoading(true);
      console.log("Fetching question set with id:", id);
      const response = await questionSetsService.getSetById(id);
      console.log("Response from getSetById:", response);
      const set = response?.data || response;
      console.log("Extracted question set:", set);
      setQuestionSet(set);
    } catch (err) {
      console.error("Failed to fetch question set:", err);
      showError("Không thể tải bộ đề");
      navigate("/expert/question-sets");
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handlePublish = async () => {
    try {
      await questionSetsService.updateSet(id, { status: "Public" });
      showSuccess("Đã công khai bộ đề cho learner Premium");
      fetchQuestionSet();
    } catch (err) {
      showError(err?.response?.data?.message || "Không thể công khai bộ đề");
    }
  };

  const handleUnpublish = async () => {
    try {
      await questionSetsService.updateSet(id, { status: "Draft" });
      showSuccess("Đã chuyển về trạng thái Draft");
      fetchQuestionSet();
    } catch (err) {
      showError(err?.response?.data?.message || "Không thể thay đổi trạng thái");
    }
  };

  const handleStartQuiz = () => {
    console.log("Starting quiz from detail page, id:", id);
    if (!id || id === 'undefined') {
      showError("ID bộ đề không hợp lệ");
      return;
    }
    navigate(`/expert/quiz/start/${id}`);
  };

  const getStatusBadge = (status) => {
    const badges = {
      Draft: { bg: "bg-slate-100", text: "text-slate-700", label: "Bản nháp" },
      Public: { bg: "bg-green-100", text: "text-green-700", label: "Công khai (Premium)" },
      Published: { bg: "bg-blue-100", text: "text-blue-700", label: "Đã xuất bản" },
      Validated: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Đã xác thực" },
    };
    const badge = badges[status] || { bg: "bg-gray-100", text: "text-gray-700", label: status };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getDifficultyBadge = (level) => {
    const badges = {
      Easy: { bg: "bg-green-100", text: "text-green-700", label: "Dễ" },
      Medium: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Trung bình" },
      Hard: { bg: "bg-red-100", text: "text-red-700", label: "Khó" },
      Remember: { bg: "bg-green-100", text: "text-green-700", label: "Nhớ" },
      Understand: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Hiểu" },
      Apply: { bg: "bg-orange-100", text: "text-orange-700", label: "Vận dụng" },
      Analyze: { bg: "bg-red-100", text: "text-red-700", label: "Phân tích" },
    };
    const badge = badges[level] || { bg: "bg-gray-100", text: "text-gray-700", label: level };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!questionSet) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="secondary" onClick={() => navigate("/expert/question-sets")}>
            ← Quay lại
          </Button>
        </div>

        {/* Expert Badge */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-t-xl">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
            </svg>
            <span className="font-semibold">Bộ đề của Expert</span>
          </div>
        </div>

        {/* Question Set Info */}
        <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
            <div className="flex-1 w-full">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{questionSet.title}</h1>
              {questionSet.description && (
                <p className="text-gray-600 mb-4">{questionSet.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>📅 {formatDate(questionSet.createdAt)}</span>
                <span>📝 {questionSet.questionCount || questionSet.questions?.length || 0} câu hỏi</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getStatusBadge(questionSet.status)}
              {questionSet.isShared && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                  ✓ Đã chia sẻ
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <Button onClick={handleStartQuiz} className="w-full sm:w-auto">
              Làm bài thử
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate(`/expert/question-sets/${id}/edit`)}
              className="w-full sm:w-auto"
            >
              Chỉnh sửa
            </Button>
            {questionSet.status === "Draft" && (
              <Button
                variant="primary"
                onClick={handlePublish}
                className="w-full sm:w-auto"
              >
                Công khai (Premium)
              </Button>
            )}
            {questionSet.status === "Public" && (
              <Button
                variant="secondary"
                onClick={handleUnpublish}
                className="w-full sm:w-auto"
              >
                Chuyển về Draft
              </Button>
            )}
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Danh sách câu hỏi ({questionSet.questions?.length || 0})
          </h2>

          <div className="space-y-4">
            {questionSet.questions?.map((q, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Question Header */}
                <div
                  onClick={() => toggleQuestion(index)}
                  className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm">
                      {index + 1}
                    </span>
                    <p className="font-medium text-gray-900 line-clamp-1">{q.questionText}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {q.difficultyLevel && getDifficultyBadge(q.difficultyLevel)}
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transform transition-transform ${expandedQuestions[index] ? "rotate-180" : ""}`}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>

                {/* Question Details */}
                {expandedQuestions[index] && (
                  <div className="p-4 border-t border-gray-200">
                    <p className="text-gray-900 mb-4 font-medium">{q.questionText}</p>

                    {/* Options */}
                    <div className="space-y-2 mb-4">
                      {q.options?.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`flex items-start gap-3 p-3 rounded-lg border ${
                            optIdx === q.correctAnswerIndex
                              ? "bg-green-50 border-green-300"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-700 font-medium text-sm flex-shrink-0 mt-0.5">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className={optIdx === q.correctAnswerIndex ? "text-green-700 font-medium" : "text-gray-700"}>
                            {opt}
                          </span>
                          {optIdx === q.correctAnswerIndex && (
                            <span className="ml-auto text-green-600 font-medium text-sm">✓ Đáp án đúng</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-blue-900 mb-1">💡 Giải thích:</p>
                        <p className="text-blue-800">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpertQuestionSetDetailPage;
