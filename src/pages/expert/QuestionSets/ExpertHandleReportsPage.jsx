/**
 * Expert Handle Reports Page
 * Xử lý báo cáo và chỉnh sửa bộ đề
 */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Input, useToast } from "@/components/common";
import questionSetsService from "@/services/api/questionSets.service";
import contentFlagsService from "@/services/api/contentFlags.service";

function ExpertHandleReportsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, showError } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);

  // Reports handling
  const [expertFlags, setExpertFlags] = useState([]);
  const [expertResponse, setExpertResponse] = useState("");
  const [respondingToFlag, setRespondingToFlag] = useState(null);
  const [submittingResponse, setSubmittingResponse] = useState(false);

  useEffect(() => {
    fetchQuestionSet();
    fetchExpertFlags();
  }, [id]);

  const fetchQuestionSet = async () => {
    try {
      setLoading(true);
      const response = await questionSetsService.getSetById(id);
      const set = response?.data || response;

      setTitle(set.title || "");
      setDescription(set.description || "");
      setQuestions(set.questions || []);
    } catch (err) {
      console.error("Failed to fetch question set:", err);
      showError("Không thể tải bộ đề");
      navigate("/expert/question-sets");
    } finally {
      setLoading(false);
    }
  };

  const fetchExpertFlags = async () => {
    try {
      const flags = await contentFlagsService.getFlagsByContent([id]);
      setExpertFlags(flags || []);
    } catch (err) {
      console.error('Failed to fetch expert flags:', err);
      setExpertFlags([]);
    }
  };

  const handleExpertRespond = async (flagId) => {
    if (!expertResponse.trim()) {
      showError("Vui lòng nhập phản hồi");
      return;
    }

    if (expertResponse.length > 1000) {
      showError("Phản hồi không được vượt quá 1000 ký tự");
      return;
    }

    setSubmittingResponse(true);
    try {
      await contentFlagsService.expertRespond(flagId, {
        response: expertResponse.trim(),
      });
      showSuccess("Đã gửi phản hồi thành công");
      setExpertResponse("");
      setRespondingToFlag(null);
      
      // Refresh flags
      const updatedFlags = await contentFlagsService.getFlagsByContent([id]);
      setExpertFlags(updatedFlags || []);
      
      // If all flags responded, navigate back
      const allResponded = (updatedFlags || []).every(f => f.status === 'ExpertResponded');
      if (allResponded && updatedFlags.length > 0) {
        setTimeout(() => {
          showSuccess("Đã xử lý xong tất cả báo cáo");
          navigate("/expert/question-sets");
        }, 1500);
      }
    } catch (err) {
      const message = err.response?.data?.message || "Không thể gửi phản hồi";
      showError(message);
    } finally {
      setSubmittingResponse(false);
    }
  };

  const handleQuestionChange = (index, field, value) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q));
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const options = q.options.map((opt, oi) => oi === oIndex ? value : opt);
      return { ...q, options };
    }));
  };

  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        questionText: "",
        options: ["", "", "", ""],
        correctAnswerIndex: 0,
        difficultyLevel: "Medium",
        explanation: "",
      }
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) {
      showError("Phải có ít nhất 1 câu hỏi");
      return;
    }
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const duplicateQuestion = (index) => {
    const questionToDuplicate = questions[index];
    setQuestions(prev => [
      ...prev.slice(0, index + 1),
      { ...questionToDuplicate },
      ...prev.slice(index + 1)
    ]);
  };

  const validateForm = () => {
    if (!title.trim()) {
      showError("Vui lòng nhập tiêu đề bộ đề");
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        showError(`Câu hỏi ${i + 1}: Chưa nhập nội dung câu hỏi`);
        return false;
      }

      if (q.options.some(opt => !opt.trim())) {
        showError(`Câu hỏi ${i + 1}: Tất cả các đáp án phải được điền`);
        return false;
      }

      if (q.correctAnswerIndex < 0 || q.correctAnswerIndex >= q.options.length) {
        showError(`Câu hỏi ${i + 1}: Đáp án đúng không hợp lệ`);
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      await questionSetsService.updateSet(id, {
        title: title.trim(),
        description: description.trim(),
        questions,
      });
      showSuccess("Đã lưu thay đổi thành công");
      // Stay on page to continue working
    } catch (err) {
      console.error("Failed to save:", err);
      const message = err.response?.data?.message || "Không thể lưu thay đổi";
      showError(message);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="secondary"
            onClick={() => navigate("/expert/question-sets")}
            className="mb-4"
          >
            ← Quay lại
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Xử lý báo cáo và chỉnh sửa bộ đề
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Xem các báo cáo từ người dùng, sửa lỗi và gửi phản hồi
          </p>
        </div>

        {/* Reports Section */}
        {expertFlags.length > 0 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h2 className="text-xl font-bold text-orange-900 dark:text-orange-100">
                Báo cáo từ Admin ({expertFlags.length})
              </h2>
            </div>
            <p className="text-sm text-orange-800 dark:text-orange-200 mb-4">
              Admin đã gửi yêu cầu xem xét các báo cáo sau. Vui lòng kiểm tra, sửa lỗi (nếu cần), và gửi phản hồi.
            </p>

            <div className="space-y-4">
              {expertFlags.map((flag) => {
                const isResponding = respondingToFlag === flag.id;
                const hasResponded = flag.status === 'ExpertResponded';

                return (
                  <div key={flag.id} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          hasResponded 
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                        }`}>
                          {hasResponded ? 'Đã phản hồi' : 'Chờ xử lý'}
                        </span>
                      </div>
                    </div>

                    {/* Flag Details */}
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-3">
                      <div className="flex items-start gap-2 mb-2">
                        <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                          <p className="font-bold text-red-900 dark:text-red-200">Loại báo cáo: {flag.reason}</p>
                          {flag.description && (
                            <p className="text-sm text-red-800 dark:text-red-300 mt-1 whitespace-pre-line">
                              {flag.description}
                            </p>
                          )}
                          {flag.reportedBy && (
                            <p className="text-xs text-red-700 dark:text-red-400 mt-2">
                              Báo cáo bởi: <span className="font-medium">{flag.reportedBy.fullName}</span> ({flag.reportedBy.email})
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Admin Note */}
                    {flag.adminNote && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-3">
                        <p className="text-xs font-bold text-amber-900 dark:text-amber-200 mb-1">Ghi chú từ Admin:</p>
                        <p className="text-sm text-amber-800 dark:text-amber-300 whitespace-pre-line">
                          {flag.adminNote}
                        </p>
                      </div>
                    )}

                    {/* Expert Response - Display if already responded */}
                    {hasResponded && flag.expertResponse && (
                      <div className="border-t border-orange-200 dark:border-orange-700 pt-3 mt-3">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <div className="flex items-start gap-2 mb-2">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-blue-900 dark:text-blue-300 mb-2">
                                Phản hồi của bạn:
                              </p>
                              <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-line">
                                {flag.expertResponse}
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                Gửi lúc: {formatDate(flag.expertRespondedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Expert Response Form - Show if not yet responded */}
                    {!hasResponded && (
                      <div className="mt-4">
                        {!isResponding ? (
                          <Button
                            size="small"
                            variant="primary"
                            onClick={() => setRespondingToFlag(flag.id)}
                          >
                            Gửi phản hồi
                          </Button>
                        ) : (
                          <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Phản hồi của bạn <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={expertResponse}
                              onChange={(e) => setExpertResponse(e.target.value)}
                              placeholder="Mô tả những gì bạn đã kiểm tra/sửa chữa..."
                              rows={4}
                              maxLength={1000}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-gray-100"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {expertResponse.length}/1000 ký tự
                            </p>
                            <div className="flex gap-2 mt-3">
                              <Button
                                variant="primary"
                                onClick={() => handleExpertRespond(flag.id)}
                                disabled={submittingResponse}
                              >
                                {submittingResponse ? "Đang gửi..." : "Gửi phản hồi"}
                              </Button>
                              <Button
                                variant="secondary"
                                onClick={() => {
                                  setRespondingToFlag(null);
                                  setExpertResponse("");
                                }}
                                disabled={submittingResponse}
                              >
                                Hủy
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Question Set Edit Form */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Chỉnh sửa bộ đề
          </h2>

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề bộ đề"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả bộ đề"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:text-gray-100"
            />
          </div>

          {/* Questions */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Câu hỏi ({questions.length})
              </label>
              <Button onClick={addQuestion}>+ Thêm câu hỏi</Button>
            </div>

            <div className="space-y-6">
              {questions.map((question, qIndex) => (
                <div key={qIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Câu {qIndex + 1}
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => duplicateQuestion(qIndex)}
                      >
                        Nhân bản
                      </Button>
                      <Button
                        size="small"
                        variant="danger"
                        onClick={() => removeQuestion(qIndex)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nội dung câu hỏi <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={question.questionText}
                      onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                      placeholder="Nhập nội dung câu hỏi"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:text-gray-100"
                    />
                  </div>

                  {/* Options */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Đáp án <span className="text-red-500">*</span>
                    </label>
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2 mb-2">
                        <input
                          type="radio"
                          checked={question.correctAnswerIndex === oIndex}
                          onChange={() => handleQuestionChange(qIndex, 'correctAnswerIndex', oIndex)}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <Input
                          value={option}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          placeholder={`Đáp án ${oIndex + 1}`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Difficulty */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Độ khó
                    </label>
                    <select
                      value={question.difficultyLevel}
                      onChange={(e) => handleQuestionChange(qIndex, 'difficultyLevel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:text-gray-100"
                    >
                      <option value="Easy">Dễ</option>
                      <option value="Medium">Trung bình</option>
                      <option value="Hard">Khó</option>
                    </select>
                  </div>

                  {/* Explanation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Giải thích
                    </label>
                    <textarea
                      value={question.explanation || ""}
                      onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                      placeholder="Giải thích đáp án đúng (tùy chọn)"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:text-gray-100"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate("/expert/question-sets")}
            >
              Hủy
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpertHandleReportsPage;
