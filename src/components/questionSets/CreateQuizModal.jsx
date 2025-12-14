/**
 * CreateQuizModal Component
 * Modal for creating new quiz with subject and document selection
 */

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import subjectsService from "@/services/api/subjects.service";
import documentsService from "@/services/api/documents.service";

function CreateQuizModal({ isOpen, onClose, onGenerate, loading }) {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [title, setTitle] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [topicDistribution, setTopicDistribution] = useState({});
  // Difficulty distribution state (percentage-based)
  const [difficultyDistribution, setDifficultyDistribution] = useState({
    "Biết": 25,
    "Hiểu": 35,
    "Vận dụng": 25,
    "Vận dụng cao": 15,
  });

  // Fetch subjects when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchSubjects();
    }
  }, [isOpen]);

  // Fetch documents when subject is selected
  useEffect(() => {
    if (selectedSubject) {
      fetchDocuments(selectedSubject.id);

      // Initialize topics from subject's table of contents
      if (selectedSubject.tableOfContents) {
        const allTopics = flattenTopics(selectedSubject.tableOfContents);
        const topicIds = allTopics.map((t) => t.topicId);
        setSelectedTopics(topicIds);

        const equalPercentage = topicIds.length > 0 ? 100 / topicIds.length : 0;
        const initialDistribution = {};
        topicIds.forEach((id) => {
          initialDistribution[id] = equalPercentage;
        });
        setTopicDistribution(initialDistribution);
        setTitle(`Bộ đề thi ${selectedSubject.subjectName}`);
      }
    } else {
      setDocuments([]);
      setSelectedTopics([]);
      setTopicDistribution({});
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      const response = await subjectsService.getSubjects({ pageSize: 100 });
      setSubjects(response.items || []);
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
    }
  };

  const fetchDocuments = async (subjectId) => {
    try {
      setLoadingDocuments(true);
      const response = await documentsService.getDocumentsBySubject(subjectId);
      const docs = response.data || response || [];
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Flatten nested topics structure
  const flattenTopics = (topics, result = []) => {
    topics.forEach((topic) => {
      result.push({ topicId: topic.topicId, topicName: topic.topicName });
      if (topic.childTopics && topic.childTopics.length > 0) {
        flattenTopics(topic.childTopics, result);
      }
    });
    return result;
  };

  const allTopics = selectedSubject?.tableOfContents
    ? flattenTopics(selectedSubject.tableOfContents)
    : [];

  // Toggle topic selection
  const handleTopicToggle = (topicId) => {
    if (selectedTopics.includes(topicId)) {
      const newSelected = selectedTopics.filter((id) => id !== topicId);
      setSelectedTopics(newSelected);

      const newDistribution = { ...topicDistribution };
      delete newDistribution[topicId];

      if (newSelected.length > 0) {
        const equalPercentage = 100 / newSelected.length;
        newSelected.forEach((id) => {
          newDistribution[id] = equalPercentage;
        });
      }
      setTopicDistribution(newDistribution);
    } else {
      const newSelected = [...selectedTopics, topicId];
      setSelectedTopics(newSelected);

      const equalPercentage = 100 / newSelected.length;
      const newDistribution = {};
      newSelected.forEach((id) => {
        newDistribution[id] = equalPercentage;
      });
      setTopicDistribution(newDistribution);
    }
  };

  // Handle topic distribution change
  const handleDistributionChange = (topicId, newValue) => {
    const value = Math.max(0, Math.min(100, parseFloat(newValue) || 0));
    const otherTopics = selectedTopics.filter((id) => id !== topicId);

    if (otherTopics.length === 0) {
      setTopicDistribution({ [topicId]: 100 });
      return;
    }

    const remaining = 100 - value;
    const currentOtherTotal = otherTopics.reduce(
      (sum, id) => sum + (topicDistribution[id] || 0),
      0
    );

    const newDistribution = { ...topicDistribution, [topicId]: value };

    if (currentOtherTotal > 0) {
      otherTopics.forEach((id) => {
        const proportion = topicDistribution[id] / currentOtherTotal;
        newDistribution[id] = remaining * proportion;
      });
    } else {
      const equalShare = remaining / otherTopics.length;
      otherTopics.forEach((id) => {
        newDistribution[id] = equalShare;
      });
    }

    setTopicDistribution(newDistribution);
  };

  // Handle difficulty distribution change
  const handleDifficultyChange = (level, newValue) => {
    const value = Math.max(0, Math.min(100, parseInt(newValue) || 0));
    setDifficultyDistribution((prev) => ({ ...prev, [level]: value }));
  };

  // Calculate total difficulty percentage
  const totalDifficultyPercentage = Object.values(difficultyDistribution).reduce((sum, val) => sum + val, 0);

  // Calculate number of questions per difficulty level
  const getQuestionsPerDifficulty = () => {
    const result = {};
    let remaining = numQuestions;
    const levels = Object.keys(difficultyDistribution);
    
    levels.forEach((level, index) => {
      if (index === levels.length - 1) {
        // Last level gets remaining to ensure total equals numQuestions
        result[level] = Math.max(0, remaining);
      } else {
        const count = Math.round((difficultyDistribution[level] / 100) * numQuestions);
        result[level] = count;
        remaining -= count;
      }
    });
    
    return result;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedSubject) {
      alert("Vui lòng chọn môn học!");
      return;
    }

    if (selectedTopics.length === 0) {
      alert("Vui lòng chọn ít nhất một chương!");
      return;
    }

    if (totalDifficultyPercentage !== 100) {
      alert("Tổng phân bổ mức độ khó phải bằng 100%!");
      return;
    }

    const topics = selectedTopics.map((topicId) => ({
      topicId,
      topicName: allTopics.find((t) => t.topicId === topicId)?.topicName || "",
      percentage: Math.round(topicDistribution[topicId] || 0),
    }));

    // Convert percentage-based difficulty to count-based for backend
    const questionsPerDifficulty = getQuestionsPerDifficulty();

    // Map Vietnamese difficulty levels to English keys expected by backend
    const difficultyMapping = {
      "Biết": "Remember",
      "Hiểu": "Understand",
      "Vận dụng": "Apply",
      "Vận dụng cao": "Analyze"
    };

    const mappedDifficultyDistribution = {};
    Object.entries(questionsPerDifficulty).forEach(([key, value]) => {
      const englishKey = difficultyMapping[key] || key;
      mappedDifficultyDistribution[englishKey] = value;
    });

    const data = {
      subjectId: selectedSubject.id,
      title,
      numQuestions,
      topics,
      difficultyDistribution: mappedDifficultyDistribution, // count format with English keys
    };

    onGenerate(data);
  };

  const handleReset = () => {
    setSelectedSubject(null);
    setTitle("");
    setNumQuestions(10);
    setSelectedTopics([]);
    setTopicDistribution({});
    setDocuments([]);
    setDifficultyDistribution({
      "Biết": 25,
      "Hiểu": 35,
      "Vận dụng": 25,
      "Vận dụng cao": 15,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo bộ đề thi mới" size="large">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject Selection */}
        <div className="form-group">
          <label htmlFor="subject-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Chọn môn học <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <select
            id="subject-select"
            value={selectedSubject?.id || ""}
            onChange={(e) => {
              const subject = subjects.find((s) => s.id === e.target.value);
              setSelectedSubject(subject || null);
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          >
            <option value="">-- Chọn môn học --</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.subjectName}
              </option>
            ))}
          </select>
        </div>

        {/* Show document info if subject selected */}
        {selectedSubject && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 dark:text-blue-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                  Môn học: {selectedSubject.subjectName}
                </p>
                {loadingDocuments ? (
                  <p className="text-sm text-blue-700 dark:text-blue-400">Đang tải tài liệu...</p>
                ) : (
                  <p className="text-sm text-blue-700 dark:text-blue-400 flex items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                      {documents.length} tài liệu
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
                      {allTopics.length} chương
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Only show other fields if subject is selected */}
        {selectedSubject && (
          <>
            {/* Title Input */}
            <div className="form-group">
              <label htmlFor="quiz-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tên bộ đề <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <input
                id="quiz-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Đề thi cuối kỳ"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
                maxLength={100}
              />
            </div>

            {/* Number of Questions Slider */}
            <div className="form-group">
              <label
                htmlFor="num-questions"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Số lượng câu hỏi: <strong className="text-primary-600 dark:text-primary-400">{numQuestions}</strong>
              </label>
              <input
                id="num-questions"
                type="range"
                min="1"
                max="20"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>1 câu</span>
                <span>20 câu</span>
              </div>
            </div>

            {/* Difficulty Distribution */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phân bổ mức độ khó
              </label>
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 space-y-3">
                {[
                  { key: "Biết", label: "Biết", color: "bg-green-500", description: "Nhớ, nhận biết" },
                  { key: "Hiểu", label: "Hiểu", color: "bg-blue-500", description: "Giải thích, so sánh" },
                  { key: "Vận dụng", label: "Vận dụng", color: "bg-yellow-500", description: "Áp dụng kiến thức" },
                  { key: "Vận dụng cao", label: "Vận dụng cao", color: "bg-red-500", description: "Phân tích, đánh giá" },
                ].map(({ key, label, color, description }) => {
                  const percentage = difficultyDistribution[key] || 0;
                  const questionCount = Math.round((percentage / 100) * numQuestions);
                  
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${color}`}></div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">({description})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {questionCount} câu
                          </span>
                          <div className="flex items-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={percentage}
                              onChange={(e) => handleDifficultyChange(key, e.target.value)}
                              className="w-14 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded focus:ring-1 focus:ring-primary-500"
                            />
                            <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">%</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${color} transition-all duration-200`} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tổng:</span>
                  <span className={`text-sm font-bold ${
                    totalDifficultyPercentage === 100 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {totalDifficultyPercentage}%
                    {totalDifficultyPercentage !== 100 && (
                      <span className="ml-1 text-xs font-normal">
                        ({totalDifficultyPercentage < 100 ? `thiếu ${100 - totalDifficultyPercentage}%` : `thừa ${totalDifficultyPercentage - 100}%`})
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Topic Selection and Distribution */}
            {allTopics.length > 0 && (
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chọn chương và tỉ lệ câu hỏi ({selectedTopics.length}/{allTopics.length} đã chọn)
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-3">
                  {allTopics.map((topic) => {
                    const isSelected = selectedTopics.includes(topic.topicId);
                    const percentage = topicDistribution[topic.topicId] || 0;

                    return (
                      <div
                        key={topic.topicId}
                        className={`p-3 rounded-lg border ${
                          isSelected
                            ? "border-primary-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                            : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50"
                        }`}
                      >
                        <label className="flex items-center gap-3 cursor-pointer mb-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleTopicToggle(topic.topicId)}
                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                          />
                          <span
                            className={`text-sm font-medium flex-1 ${
                              isSelected ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {topic.topicName}
                          </span>
                          <span
                            className={`text-sm font-bold ${
                              isSelected ? "text-primary-600 dark:text-primary-400" : "text-gray-400 dark:text-gray-500"
                            }`}
                          >
                            {Math.round(percentage)}%
                          </span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={percentage}
                          onChange={(e) => handleDistributionChange(topic.topicId, e.target.value)}
                          disabled={!isSelected}
                          className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                            isSelected ? "bg-gray-200 dark:bg-gray-700" : "bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Tổng:{" "}
                  <strong
                    className={`${
                      Math.round(
                        Object.values(topicDistribution).reduce((sum, val) => sum + val, 0)
                      ) === 100
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {Math.round(
                      Object.values(topicDistribution).reduce((sum, val) => sum + val, 0)
                    )}
                    %
                  </strong>
                </div>
              </div>
            )}
          </>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="secondary" onClick={handleReset} disabled={loading}>
            Đặt lại
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={!selectedSubject || selectedTopics.length === 0}
          >
            <span className="inline-flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="10" width="20" height="12" rx="2" ry="2"></rect><path d="M22 12V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v6"></path></svg>
              Tạo đề thi
            </span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}

CreateQuizModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onGenerate: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default CreateQuizModal;
