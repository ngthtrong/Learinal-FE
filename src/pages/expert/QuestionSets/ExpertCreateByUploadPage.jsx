/**
 * Expert Create Question Set by Upload
 * Expert upload document để tạo bộ đề và có thể chỉnh sửa trước khi lưu
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, useToast } from "@/components/common";
import documentsService from "@/services/api/documents.service";
import questionSetsService from "@/services/api/questionSets.service";

function ExpertCreateByUploadPage() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview & Edit, 3: Done
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Step 1: Upload
  const [file, setFile] = useState(null);
  const [uploadedDocId, setUploadedDocId] = useState(null);
  
  // Step 2: Generation params & preview
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionType, setQuestionType] = useState("multiple-choice");
  
  // Generated questions for preview/edit
  const [questions, setQuestions] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      showError("Vui lòng chọn file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await documentsService.uploadDocument(formData);
      const docId = response?.data?.id || response?.id;
      
      setUploadedDocId(docId);
      showSuccess("Upload thành công! Nhập thông tin bộ đề");
      setStep(2);
    } catch (err) {
      console.error("Upload failed:", err);
      showError(err?.response?.data?.message || "Upload thất bại");
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!title.trim()) {
      showError("Vui lòng nhập tiêu đề");
      return;
    }

    setGenerating(true);
    try {
      const payload = {
        documentId: uploadedDocId,
        title: title.trim(),
        description: description.trim() || undefined,
        numQuestions,
        difficulty,
        questionType,
      };

      const response = await questionSetsService.generateFromDocument(payload);
      const generatedQuestions = response?.questions || [];
      
      setQuestions(generatedQuestions);
      showSuccess("Đã tạo câu hỏi! Xem và chỉnh sửa trước khi lưu");
      setStep(3);
    } catch (err) {
      console.error("Generation failed:", err);
      showError(err?.response?.data?.message || "Tạo câu hỏi thất bại");
    } finally {
      setGenerating(false);
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

  const handleSave = async () => {
    if (questions.length === 0) {
      showError("Không có câu hỏi để lưu");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        questions,
        status: "Draft",
      };

      const response = await questionSetsService.createQuestionSet(payload);
      const setId = response?.data?.id || response?.id;
      
      showSuccess("Đã lưu bộ đề thành công!");
      navigate(`/question-sets/${setId}`);
    } catch (err) {
      console.error("Save failed:", err);
      showError(err?.response?.data?.message || "Lưu bộ đề thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="secondary" onClick={() => navigate("/expert/question-sets")} className="w-full sm:w-auto">
            ← Quay lại
          </Button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 sm:p-6 lg:p-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Tạo bộ đề từ tài liệu
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-6 sm:mb-8">
            Upload tài liệu và AI sẽ tạo câu hỏi, bạn có thể chỉnh sửa trước khi lưu
          </p>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[
              { num: 1, label: "Upload tài liệu" },
              { num: 2, label: "Thông tin bộ đề" },
              { num: 3, label: "Xem & Chỉnh sửa" },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step >= s.num
                    ? "bg-primary-600 border-primary-600 text-white"
                    : "border-gray-300 dark:border-gray-600 text-gray-400"
                }`}>
                  {s.num}
                </div>
                <span className={`ml-3 text-sm font-medium ${
                  step >= s.num ? "text-gray-900 dark:text-gray-100" : "text-gray-400"
                }`}>
                  {s.label}
                </span>
                {i < 2 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    step > s.num ? "bg-primary-600" : "bg-gray-300 dark:bg-slate-600"
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chọn tài liệu
                </label>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-slate-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-slate-700 focus:outline-none"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Hỗ trợ: PDF, DOCX, TXT (tối đa 10MB)
                </p>
              </div>

              {file && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <span className="font-medium">File đã chọn:</span> {file.name}
                  </p>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full"
              >
                {uploading ? "Đang upload..." : "Upload và tiếp tục"}
              </Button>
            </div>
          )}

          {/* Step 2: Question Set Info */}
          {step === 2 && (
            <div className="space-y-6">
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Số câu hỏi
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(parseInt(e.target.value) || 10)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Độ khó
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="Easy">Dễ</option>
                    <option value="Medium">Trung bình</option>
                    <option value="Hard">Khó</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Loại câu hỏi
                  </label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="multiple-choice">Trắc nghiệm</option>
                    <option value="true-false">Đúng/Sai</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(1)}>
                  ← Quay lại
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={!title.trim() || generating}
                  className="flex-1"
                >
                  {generating ? "Đang tạo câu hỏi..." : "Tạo câu hỏi"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Preview & Edit */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-300">
                  ✓ Đã tạo {questions.length} câu hỏi. Xem và chỉnh sửa trước khi lưu.
                </p>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {questions.map((q, qIdx) => (
                  <div key={qIdx} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-900">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Câu #{qIdx + 1}
                      </span>
                      <select
                        value={q.difficultyLevel || "Medium"}
                        onChange={(e) => handleQuestionChange(qIdx, "difficultyLevel", e.target.value)}
                        className="text-xs px-2 py-1 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="Easy">Dễ</option>
                        <option value="Medium">Trung bình</option>
                        <option value="Hard">Khó</option>
                      </select>
                    </div>

                    <textarea
                      value={q.questionText || ""}
                      onChange={(e) => handleQuestionChange(qIdx, "questionText", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 mb-3"
                      rows="2"
                    />

                    <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Phương án (Click radio để chọn đáp án đúng)
                      </div>
                      {q.options?.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qIdx}`}
                            checked={q.correctAnswerIndex === oIdx}
                            onChange={() => handleQuestionChange(qIdx, "correctAnswerIndex", oIdx)}
                            className="w-4 h-4 text-green-600"
                          />
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                            q.correctAnswerIndex === oIdx
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                              : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300"
                          }`}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <input
                            type="text"
                            value={opt || ""}
                            onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-sm text-gray-900 dark:text-gray-100"
                          />
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Giải thích
                        </label>
                        <textarea
                          value={q.explanation || ""}
                          onChange={(e) => handleQuestionChange(qIdx, "explanation", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-sm text-gray-900 dark:text-gray-100"
                          rows="2"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(2)}>
                  ← Quay lại
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? "Đang lưu..." : "Lưu bộ đề"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExpertCreateByUploadPage;
