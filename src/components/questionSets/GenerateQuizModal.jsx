/**
 * GenerateQuizModal Component
 * Modal for generating quiz from subject with customizable options
 */

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
function GenerateQuizModal({ isOpen, onClose, subject, onGenerate, loading }) {
  const [title, setTitle] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [topicDistribution, setTopicDistribution] = useState({});

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

  // Initialize selected topics and distribution when modal opens
  useEffect(() => {
    if (isOpen && subject?.tableOfContents) {
      const allTopics = flattenTopics(subject.tableOfContents);
      const topicIds = allTopics.map((t) => t.topicId);
      setSelectedTopics(topicIds);

      // Initialize equal distribution
      const equalPercentage = topicIds.length > 0 ? 100 / topicIds.length : 0;
      const initialDistribution = {};
      topicIds.forEach((id) => {
        initialDistribution[id] = equalPercentage;
      });
      setTopicDistribution(initialDistribution);
      setTitle(`Bộ đề thi ${subject.subjectName}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, subject]);

  const allTopics = subject?.tableOfContents ? flattenTopics(subject.tableOfContents) : [];

  // Toggle topic selection
  const handleTopicToggle = (topicId) => {
    if (selectedTopics.includes(topicId)) {
      // Deselect
      const newSelected = selectedTopics.filter((id) => id !== topicId);
      setSelectedTopics(newSelected);

      // Redistribute percentages
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
      // Select
      const newSelected = [...selectedTopics, topicId];
      setSelectedTopics(newSelected);

      // Redistribute percentages
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

    // Calculate remaining percentage for other topics
    const remaining = 100 - value;
    const currentOtherTotal = otherTopics.reduce(
      (sum, id) => sum + (topicDistribution[id] || 0),
      0
    );

    const newDistribution = { ...topicDistribution, [topicId]: value };

    // Redistribute remaining percentage proportionally
    if (currentOtherTotal > 0) {
      otherTopics.forEach((id) => {
        const proportion = topicDistribution[id] / currentOtherTotal;
        newDistribution[id] = remaining * proportion;
      });
    } else {
      // Equal distribution if no previous values
      const equalShare = remaining / otherTopics.length;
      otherTopics.forEach((id) => {
        newDistribution[id] = equalShare;
      });
    }

    setTopicDistribution(newDistribution);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedTopics.length === 0) {
      alert("Vui lòng chọn ít nhất một chương!");
      return;
    }

    // Build topics array with distribution
    const topics = selectedTopics.map((topicId) => ({
      topicId,
      topicName: allTopics.find((t) => t.topicId === topicId)?.topicName || "",
      percentage: Math.round(topicDistribution[topicId] || 0),
    }));

    const data = {
      subjectId: subject.id,
      title,
      numQuestions,
      topics,
    };

    onGenerate(data);
  };

  const handleReset = () => {
    const topicIds = allTopics.map((t) => t.topicId);
    setSelectedTopics(topicIds);
    const equalPercentage = topicIds.length > 0 ? 100 / topicIds.length : 0;
    const initialDistribution = {};
    topicIds.forEach((id) => {
      initialDistribution[id] = equalPercentage;
    });
    setTopicDistribution(initialDistribution);
    setNumQuestions(10);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo bộ đề thi mới" size="large">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject Info */}
        {subject && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 dark:text-blue-400 text-xl">ℹ️</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Môn học: {subject.subjectName}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">📚 {allTopics.length} chương</p>
              </div>
            </div>
          </div>
        )}

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
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400"
            required
            maxLength={100}
          />
        </div>

        {/* Number of Questions Slider */}
        <div className="form-group">
          <label htmlFor="num-questions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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

        {/* Topic Selection and Distribution */}
        {allTopics.length > 0 && (
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chọn chương và tỉ lệ câu hỏi ({selectedTopics.length}/{allTopics.length} đã chọn)
            </label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-3 bg-white dark:bg-gray-800/50">
              {allTopics.map((topic) => {
                const isSelected = selectedTopics.includes(topic.topicId);
                const percentage = topicDistribution[topic.topicId] || 0;

                return (
                  <div
                    key={topic.topicId}
                    className={`p-3 rounded-lg border ${
                      isSelected ? "border-primary-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20" : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                    }`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleTopicToggle(topic.topicId)}
                        className="w-4 h-4 text-primary-600 dark:text-primary-500 rounded focus:ring-primary-500 dark:focus:ring-primary-400"
                      />
                      <span
                        className={`text-sm font-medium flex-1 ${
                          isSelected ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-500"
                        }`}
                      >
                        {topic.topicName}
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          isSelected ? "text-primary-600 dark:text-primary-400" : "text-gray-400 dark:text-gray-600"
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
                {Math.round(Object.values(topicDistribution).reduce((sum, val) => sum + val, 0))}%
              </strong>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="secondary" onClick={handleReset} disabled={loading}>
            Đặt lại
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" loading={loading} disabled={selectedTopics.length === 0}>
            🎲 Tạo đề thi
          </Button>
        </div>
      </form>
    </Modal>
  );
}

GenerateQuizModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  subject: PropTypes.shape({
    id: PropTypes.string.isRequired,
    subjectName: PropTypes.string.isRequired,
    tableOfContents: PropTypes.array,
  }),
  onGenerate: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default GenerateQuizModal;
