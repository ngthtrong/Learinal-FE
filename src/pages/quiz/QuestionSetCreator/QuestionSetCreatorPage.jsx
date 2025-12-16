/**
 * QuestionSetCreator Component
 * Create question sets from documents using AI
 */

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import { questionSetsService, subjectsService } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";
function QuestionSetCreatorPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // State
  const [subject, setSubject] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [numQuestions, setNumQuestions] = useState(20);
  const [difficulty, setDifficulty] = useState({
    remember: 20,
    understand: 25,
    apply: 20,
    analyze: 15,
    evaluate: 10,
    create: 10,
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
        setError(t("quizPages.creator.errors.loadSubject"));
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
      setError(t("quizPages.creator.errors.selectTopic"));
      return;
    }

    if (totalDifficultyPercentage !== 100) {
      setError(t("quizPages.creator.errors.difficultyTotal"));
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
      setError(err.response?.data?.message || t("quizPages.creator.errors.generate"));
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
            setError(status.error || t("quizPages.creator.errors.generate"));
            setGenerating(false);
          }
        } catch {
          clearInterval(pollInterval);
          setError(t("quizPages.creator.errors.checkStatus"));
          setGenerating(false);
        }
      }, 2000); // Poll every 2 seconds

      // Cleanup after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        if (generating) {
          setError(t("quizPages.creator.errors.timeout"));
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
        <p>{t("quizPages.creator.loading")}</p>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="question-set-creator-page error">
        <p>{t("quizPages.creator.errors.notFound")}</p>
        <Button onClick={() => navigate(-1)}>{t("quizPages.creator.goBack")}</Button>
      </div>
    );
  }

  return (
    <div className="question-set-creator-page">
      <div className="page-header">
        <h1 className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600 dark:text-primary-400"><path d="M9 11H3v2h6m-6 7h6v-2H3m15 2h3v-2h-3M21 3v12h-6V3m-2 0h2v2h-2m2 10h2v-2h-2M9 3h2v2H9m0 4h2v2H9z"></path></svg>
          </div>
          {t("quizPages.creator.pageTitle", { subjectName: subject.name })}
        </h1>
        <p className="subtitle">{t("quizPages.creator.subtitle")}</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="creator-form">
        {/* Topic Selection */}
        <section className="form-section">
          <h2>{t("quizPages.creator.selectContent")}</h2>
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
                  <span className="topic-label">{topic.title || t("quizPages.creator.chapterLabel", { index: index + 1 })}</span>
                </label>
              ))
            ) : (
              <p className="no-topics">
                {t("quizPages.creator.noToc")}
              </p>
            )}
          </div>
        </section>

        {/* Number of Questions */}
        <section className="form-section">
          <h2>{t("quizPages.creator.numQuestions", { num: numQuestions })}</h2>
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

        {/* Difficulty Distribution - Bloom's Taxonomy (6 levels) */}
        <section className="form-section">
          <h2>{t("quizPages.creator.difficultyTitle")}</h2>
          <div className="difficulty-controls">
            {[
              { key: "remember", label: t("quizPages.creator.difficulty.remember") },
              { key: "understand", label: t("quizPages.creator.difficulty.understand") },
              { key: "apply", label: t("quizPages.creator.difficulty.apply") },
              { key: "analyze", label: t("quizPages.creator.difficulty.analyze") },
              { key: "evaluate", label: t("quizPages.creator.difficulty.evaluate") },
              { key: "create", label: t("quizPages.creator.difficulty.create") },
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
              <span>{t("quizPages.creator.total")}:</span>
              <span className={totalDifficultyPercentage === 100 ? "valid" : "invalid"}>
                {totalDifficultyPercentage}%
              </span>
            </div>
          </div>
        </section>

        {/* Quota Info */}
        <div className="quota-info flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line><circle cx="12" cy="12" r="5"></circle></svg>
          {t("quizPages.creator.quotaInfo")}
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={generating}>
            {t("quizPages.creator.cancel")}
          </Button>
          <Button onClick={handleGenerate} disabled={generating} loading={generating}>
            {generating ? (
              <span className="inline-flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                {t("quizPages.creator.generating")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="10" width="20" height="12" rx="2" ry="2"></rect><path d="M22 12V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v6"></path></svg>
                {t("quizPages.creator.createSet")}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Generating Modal */}
      {generating && (
        <Modal isOpen={true} onClose={() => {}} title={t("quizPages.creator.generatingModal.title")}>
          <div className="generating-modal">
            <div className="progress-animation">
              <div className="spinner large"></div>
            </div>
            <ul className="generation-steps">
              <li className="completed flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                {t("quizPages.creator.generatingModal.step1")}
              </li>
              <li className="completed flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                {t("quizPages.creator.generatingModal.step2")}
              </li>
              <li className="active flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                {t("quizPages.creator.generatingModal.step3")}
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>
                {t("quizPages.creator.generatingModal.step4")}
              </li>
            </ul>
            <p className="estimate-time">{t("quizPages.creator.generatingModal.estimateTime")}</p>
          </div>
        </Modal>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <Modal isOpen={true} onClose={() => setShowSuccessModal(false)} title={t("quizPages.creator.successModal.title")}>
          <div className="success-modal">
            <p>{t("quizPages.creator.successModal.message", { numQuestions })}</p>
            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setShowSuccessModal(false)}>
                {t("quizPages.creator.successModal.close")}
              </Button>
              <Button onClick={handleViewSet}>{t("quizPages.creator.successModal.viewSet")}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default QuestionSetCreatorPage;
