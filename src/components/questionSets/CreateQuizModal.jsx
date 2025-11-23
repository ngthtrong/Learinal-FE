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

    const topics = selectedTopics.map((topicId) => ({
      topicId,
      topicName: allTopics.find((t) => t.topicId === topicId)?.topicName || "",
      percentage: Math.round(topicDistribution[topicId] || 0),
    }));

    const data = {
      subjectId: selectedSubject.id,
      title,
      numQuestions,
      topics,
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
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo bộ đề thi mới" size="large">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject Selection */}
        <div className="form-group">
          <label htmlFor="subject-select" className="block text-sm font-medium text-gray-700 mb-2">
            Chọn môn học <span className="text-red-500">*</span>
          </label>
          <select
            id="subject-select"
            value={selectedSubject?.id || ""}
            onChange={(e) => {
              const subject = subjects.find((s) => s.id === e.target.value);
              setSelectedSubject(subject || null);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 text-xl">ℹ️</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Môn học: {selectedSubject.subjectName}
                </p>
                {loadingDocuments ? (
                  <p className="text-sm text-blue-700">Đang tải tài liệu...</p>
                ) : (
                  <p className="text-sm text-blue-700">
                    📄 {documents.length} tài liệu • 📚 {allTopics.length} chương
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
              <label htmlFor="quiz-title" className="block text-sm font-medium text-gray-700 mb-2">
                Tên bộ đề <span className="text-red-500">*</span>
              </label>
              <input
                id="quiz-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Đề thi cuối kỳ"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
                maxLength={100}
              />
            </div>

            {/* Number of Questions Slider */}
            <div className="form-group">
              <label
                htmlFor="num-questions"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Số lượng câu hỏi: <strong className="text-primary-600">{numQuestions}</strong>
              </label>
              <input
                id="num-questions"
                type="range"
                min="1"
                max="20"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 câu</span>
                <span>20 câu</span>
              </div>
            </div>

            {/* Topic Selection */}
            {allTopics.length > 0 && (
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn chương ({selectedTopics.length}/{allTopics.length} đã chọn)
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                  {allTopics.map((topic) => (
                    <label
                      key={topic.topicId}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTopics.includes(topic.topicId)}
                        onChange={() => handleTopicToggle(topic.topicId)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{topic.topicName}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Topic Distribution */}
            {selectedTopics.length > 0 && (
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tỉ lệ câu hỏi theo chương
                </label>
                <div className="space-y-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {selectedTopics.map((topicId) => {
                    const topic = allTopics.find((t) => t.topicId === topicId);
                    const percentage = topicDistribution[topicId] || 0;

                    return (
                      <div key={topicId} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">{topic?.topicName}</span>
                          <span className="text-sm font-medium text-primary-600">
                            {Math.round(percentage)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={percentage}
                          onChange={(e) => handleDistributionChange(topicId, e.target.value)}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  Tổng:{" "}
                  <strong
                    className={`${
                      Math.round(
                        Object.values(topicDistribution).reduce((sum, val) => sum + val, 0)
                      ) === 100
                        ? "text-green-600"
                        : "text-red-600"
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
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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
            🎲 Tạo đề thi
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
