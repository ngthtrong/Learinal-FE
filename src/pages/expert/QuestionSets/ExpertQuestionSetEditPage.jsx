/**
 * Expert Question Set Edit Page
 * Chỉnh sửa bộ đề Draft của expert
 */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Input, useToast } from "@/components/common";
import questionSetsService from "@/services/api/questionSets.service";

function ExpertQuestionSetEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, showError } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchQuestionSet();
  }, [id]);

  const fetchQuestionSet = async () => {
    try {
      setLoading(true);
      const response = await questionSetsService.getSetById(id);
      const set = response?.data || response;
      
      if (set.status !== "Public" && set.status !== "Draft") {
        showError("Chỉ có thể chỉnh sửa bộ đề ở trạng thái Public hoặc Draft");
        navigate("/expert/question-sets");
        return;
      }

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
      
      const filledOptions = q.options.filter(opt => opt.trim());
      if (filledOptions.length < 2) {
        showError(`Câu hỏi ${i + 1}: Phải có ít nhất 2 đáp án`);
        return false;
      }

      if (!q.options[q.correctAnswerIndex]?.trim()) {
        showError(`Câu hỏi ${i + 1}: Đáp án đúng không được để trống`);
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        questions: questions.map(q => {
          const nonEmptyOptions = [];
          let newCorrectIndex = 0;
          
          q.options.forEach((opt, idx) => {
            const trimmedOpt = opt.trim();
            if (trimmedOpt) {
              if (idx === q.correctAnswerIndex) {
                newCorrectIndex = nonEmptyOptions.length;
              }
              nonEmptyOptions.push(trimmedOpt);
            }
          });

          return {
            questionText: q.questionText.trim(),
            options: nonEmptyOptions,
            correctAnswerIndex: newCorrectIndex,
            difficultyLevel: q.difficultyLevel,
            explanation: q.explanation?.trim() || undefined,
          };
        }),
      };

      await questionSetsService.updateSet(id, payload);
      showSuccess("Đã cập nhật bộ đề thành công!");
      navigate("/expert/question-sets");
    } catch (err) {
      console.error("Update failed:", err);
      showError(err?.response?.data?.message || "Cập nhật bộ đề thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:to-gray-900 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:to-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <Button variant="secondary" onClick={() => navigate("/expert/question-sets")} className="w-full sm:w-auto">
            ← Quay lại
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Chỉnh sửa bộ đề
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-6 sm:mb-8">
            Cập nhật thông tin và câu hỏi cho bộ đề của bạn
          </p>

          {/* Basic Info */}
          <div className="space-y-6 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <Input
              label="Tiêu đề bộ đề"
              placeholder="Nhập tiêu đề..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mô tả
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn về bộ đề..."
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                Câu hỏi ({questions.length})
              </h2>
              <Button size="small" onClick={addQuestion} className="w-full sm:w-auto">
                <span className="inline-flex items-center justify-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Thêm câu hỏi
                </span>
              </Button>
            </div>

            {questions.map((q, qIdx) => (
              <div key={qIdx} className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 relative">
                {/* Question Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
                  <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Câu #{qIdx + 1}
                  </span>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      value={q.difficultyLevel}
                      onChange={(e) => handleQuestionChange(qIdx, "difficultyLevel", e.target.value)}
                      className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex-1 sm:flex-none"
                    >
                      <option value="Easy">Dễ</option>
                      <option value="Medium">Trung bình</option>
                      <option value="Hard">Khó</option>
                    </select>
                    <button
                      onClick={() => duplicateQuestion(qIdx)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                      title="Nhân bản câu hỏi"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => removeQuestion(qIdx)}
                      className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      title="Xóa câu hỏi"
                      disabled={questions.length === 1}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nội dung câu hỏi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={q.questionText}
                    onChange={(e) => handleQuestionChange(qIdx, "questionText", e.target.value)}
                    placeholder="Nhập nội dung câu hỏi..."
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Options */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Đáp án <span className="text-red-500">*</span>
                    <span className="hidden sm:inline ml-2 text-xs text-gray-500">(Click radio để chọn đáp án đúng)</span>
                  </label>
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-1.5 sm:gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIdx}`}
                          checked={q.correctAnswerIndex === oIdx}
                          onChange={() => handleQuestionChange(qIdx, "correctAnswerIndex", oIdx)}
                          className="w-4 h-4 text-green-600 focus:ring-green-500 flex-shrink-0"
                        />
                        <span className={`text-xs sm:text-sm px-2 sm:px-2.5 py-0.5 sm:py-1 rounded font-medium min-w-[28px] sm:min-w-[32px] text-center flex-shrink-0 ${
                          q.correctAnswerIndex === oIdx
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        }`}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                          placeholder={`Đáp án ${String.fromCharCode(65 + oIdx)}`}
                          className="flex-1 min-w-0 px-3 sm:px-4 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Giải thích (tùy chọn)
                  </label>
                  <textarea
                    value={q.explanation}
                    onChange={(e) => handleQuestionChange(qIdx, "explanation", e.target.value)}
                    placeholder="Giải thích đáp án đúng..."
                    rows="2"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              variant="secondary"
              onClick={() => navigate("/expert/question-sets")}
              disabled={saving}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:flex-1 order-1 sm:order-2"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpertQuestionSetEditPage;
