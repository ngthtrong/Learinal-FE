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
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo bộ đề thi tự động" size="large">
      <form onSubmit={handleSubmit} className="generate-quiz-form space-y-6">
        {/* Title Input */}
        <div className="form-group">
          <label htmlFor="quiz-title">Tên bộ đề : </label>
          <input
            id="quiz-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Đề thi cuối kỳ"
            required
            maxLength={100}
          />
        </div>

        {/* Number of Questions Slider */}
        <div className="form-group">
          <label htmlFor="num-questions">
            Số lượng câu hỏi: <strong>{numQuestions}</strong>
          </label>
          <input
            id="num-questions"
            type="range"
            min="1"
            max="20"
            value={numQuestions}
            onChange={(e) => setNumQuestions(parseInt(e.target.value))}
            className="slider"
          />
          <div className="slider-labels">
            <span>1 - 20 câu hỏi</span>
          </div>
        </div>

        {/* Topic Selection */}
        <div className="form-group">
          <label>Chọn chương ({selectedTopics.length} đã chọn)</label>
          <div className="topics-list">
            {allTopics.map((topic) => (
              <div key={topic.topicId} className="topic-item">
                <label className="topic-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedTopics.includes(topic.topicId)}
                    onChange={() => handleTopicToggle(topic.topicId)}
                  />
                  <span>{topic.topicName}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Distribution */}
        {selectedTopics.length > 0 && (
          <div className="form-group">
            <label>Tỉ lệ câu hỏi theo chương :</label>
            <div className="distribution-list">
              {selectedTopics.map((topicId) => {
                const topic = allTopics.find((t) => t.topicId === topicId);
                const percentage = topicDistribution[topicId] || 0;

                return (
                  <div key={topicId} className="distribution-item">
                    <div className="distribution-header">
                      <span className="topic-name">{topic?.topicName}</span>
                      <span className="percentage-value">{Math.round(percentage)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={percentage}
                      onChange={(e) => handleDistributionChange(topicId, e.target.value)}
                      className="slider distribution-slider"
                    />
                  </div>
                );
              })}
            </div>
            <div className="distribution-total">
              Tổng:{" "}
              <strong>
                {Math.round(Object.values(topicDistribution).reduce((sum, val) => sum + val, 0))}%
              </strong>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions mt-6 flex justify-start gap-3">
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
