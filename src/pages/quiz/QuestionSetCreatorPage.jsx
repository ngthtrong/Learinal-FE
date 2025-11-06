/**
 * QuestionSetCreator Component
 * Create question sets from documents using AI
 */

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import { questionSetsService, subjectsService } from "@/services/api";
import "./QuestionSetCreatorPage.css";

function QuestionSetCreatorPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  // State
  const [subject, setSubject] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [numQuestions, setNumQuestions] = useState(20);
  const [difficulty, setDifficulty] = useState({
    know: 30,
    understand: 30,
    apply: 25,
    analyze: 15,
  });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedSetId, setGeneratedSetId] = useState(null);

  // Load subject and TOC
  useEffect(() => {
    const loadSubject = async () => {
      try {
        setLoading(true);
        const data = await subjectsService.getSubjectById(subjectId);
        setSubject(data);

        // Pre-select all topics if available
        if (data.tableOfContents && data.tableOfContents.length > 0) {
          setSelectedTopics(data.tableOfContents.map((topic) => topic.id || topic.title));
        }
      } catch (err) {
        setError("Không thể tải thông tin môn học");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (subjectId) {
      loadSubject();
    }
  }, [subjectId]);

  // Handle topic selection
  const handleTopicToggle = (topicId) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  // Handle difficulty change
  const handleDifficultyChange = (level, value) => {
    const newValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    setDifficulty((prev) => ({ ...prev, [level]: newValue }));
  };

  // Calculate total difficulty percentage
  const totalDifficultyPercentage = Object.values(difficulty).reduce((sum, val) => sum + val, 0);

  // Handle generate question set
  const handleGenerate = async () => {
    // Validation
    if (selectedTopics.length === 0) {
      setError("Vui lòng chọn ít nhất một chương/mục");
      return;
    }

    if (totalDifficultyPercentage !== 100) {
      setError("Tổng phân bổ mức độ khó phải bằng 100%");
      return;
    }

    try {
      setGenerating(true);
      setError("");

      // Call generate API
      const result = await questionSetsService.generateQuestionSet({
        subjectId,
        topics: selectedTopics,
        numQuestions,
        difficulty,
      });

      // Start polling for job status
      pollJobStatus(result.jobId);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tạo bộ câu hỏi");
      setGenerating(false);
    }
  };

  // Poll job status
  const pollJobStatus = useCallback(
    async (currentJobId) => {
      const pollInterval = setInterval(async () => {
        try {
          const status = await questionSetsService.checkJobStatus(currentJobId);

          if (status.status === "completed") {
            clearInterval(pollInterval);
            setGeneratedSetId(status.questionSetId);
            setGenerating(false);
            setShowSuccessModal(true);
          } else if (status.status === "failed") {
            clearInterval(pollInterval);
            setError(status.error || "Không thể tạo bộ câu hỏi");
            setGenerating(false);
          }
        } catch {
          clearInterval(pollInterval);
          setError("Lỗi khi kiểm tra trạng thái");
          setGenerating(false);
        }
      }, 2000); // Poll every 2 seconds

      // Cleanup after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        if (generating) {
          setError("Quá thời gian chờ. Vui lòng thử lại sau.");
          setGenerating(false);
        }
      }, 300000);
    },
    [generating]
  );

  // Handle view generated set
  const handleViewSet = () => {
    navigate(`/question-sets/${generatedSetId}`);
  };

  if (loading) {
    return (
      <div className="question-set-creator-page loading">
        <div className="spinner"></div>
        <p>Đang tải thông tin môn học...</p>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="question-set-creator-page error">
        <p>Không tìm thấy môn học</p>
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="question-set-creator-page">
      <div className="page-header">
        <h1>🎯 Tạo bộ câu hỏi - {subject.name}</h1>
        <p className="subtitle">Sử dụng AI để tự động sinh câu hỏi từ tài liệu</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="creator-form">
        {/* Topic Selection */}
        <section className="form-section">
          <h2>1. Chọn nội dung</h2>
          <div className="topics-list">
            {subject.tableOfContents && subject.tableOfContents.length > 0 ? (
              subject.tableOfContents.map((topic, index) => (
                <label key={topic.id || index} className="topic-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedTopics.includes(topic.id || topic.title)}
                    onChange={() => handleTopicToggle(topic.id || topic.title)}
                    disabled={generating}
                  />
                  <span className="topic-label">{topic.title || `Chương ${index + 1}`}</span>
                </label>
              ))
            ) : (
              <p className="no-topics">
                Chưa có mục lục. Vui lòng tạo mục lục trước khi tạo câu hỏi.
              </p>
            )}
          </div>
        </section>

        {/* Number of Questions */}
        <section className="form-section">
          <h2>2. Số lượng câu hỏi: {numQuestions}</h2>
          <div className="slider-container">
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              disabled={generating}
              className="question-slider"
            />
            <div className="slider-labels">
              <span>5</span>
              <span>25</span>
              <span>50</span>
            </div>
          </div>
        </section>

        {/* Difficulty Distribution */}
        <section className="form-section">
          <h2>3. Phân bổ mức độ khó</h2>
          <div className="difficulty-controls">
            {[
              { key: "know", label: "Biết" },
              { key: "understand", label: "Hiểu" },
              { key: "apply", label: "Vận dụng" },
              { key: "analyze", label: "Vận dụng cao" },
            ].map(({ key, label }) => (
              <div key={key} className="difficulty-row">
                <label className="difficulty-label">{label}</label>
                <div className="difficulty-input-group">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={difficulty[key]}
                    onChange={(e) => handleDifficultyChange(key, e.target.value)}
                    disabled={generating}
                    className="difficulty-input"
                  />
                  <span className="percentage-sign">%</span>
                </div>
                <div className="difficulty-bar">
                  <div className="difficulty-fill" style={{ width: `${difficulty[key]}%` }}></div>
                </div>
              </div>
            ))}
            <div className="difficulty-total">
              <span>Tổng:</span>
              <span className={totalDifficultyPercentage === 100 ? "valid" : "invalid"}>
                {totalDifficultyPercentage}%
              </span>
            </div>
          </div>
        </section>

        {/* Quota Info */}
        <div className="quota-info">💡 Quota: Còn 3/5 đề tháng này (miễn phí)</div>

        {/* Action Buttons */}
        <div className="form-actions">
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={generating}>
            Hủy
          </Button>
          <Button onClick={handleGenerate} disabled={generating} loading={generating}>
            {generating ? "⏳ Đang tạo..." : "🎲 Tạo đề"}
          </Button>
        </div>
      </div>

      {/* Generating Modal */}
      {generating && (
        <Modal isOpen={true} onClose={() => {}} title="Đang tạo bộ câu hỏi">
          <div className="generating-modal">
            <div className="progress-animation">
              <div className="spinner large"></div>
            </div>
            <ul className="generation-steps">
              <li className="completed">✓ Phân tích nội dung</li>
              <li className="completed">✓ Tạo câu hỏi mức Biết</li>
              <li className="active">🔄 Tạo câu hỏi mức Hiểu</li>
              <li>Tạo câu hỏi mức Vận dụng</li>
            </ul>
            <p className="estimate-time">Ước tính còn: 15 giây</p>
          </div>
        </Modal>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <Modal isOpen={true} onClose={() => setShowSuccessModal(false)} title="✅ Tạo thành công!">
          <div className="success-modal">
            <p>Bộ câu hỏi đã được tạo thành công với {numQuestions} câu.</p>
            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setShowSuccessModal(false)}>
                Đóng
              </Button>
              <Button onClick={handleViewSet}>Xem bộ câu hỏi</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default QuestionSetCreatorPage;
