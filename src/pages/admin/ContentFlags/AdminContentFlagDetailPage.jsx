import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { contentFlagsService } from "@/services/api";
import questionSetsService from "@/services/api/questionSets.service";
import Button from "@/components/common/Button";
import { useToast } from "@/components/common";
import { getErrorMessage } from "@/utils/errorHandler";
import { formatDate } from "@/utils/formatters";
import { useLanguage } from "@/contexts/LanguageContext";

const AdminContentFlagDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useLanguage();
  const [flag, setFlag] = useState(null);
  const [questionSet, setQuestionSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [showResolveModal, setShowResolveModal] = useState(false);

  useEffect(() => {
    fetchFlag();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchFlag = async () => {
    try {
      setLoading(true);
      const data = await contentFlagsService.getFlagById(id);
      setFlag(data);
      
      // Fetch question set with questions
      if (data.contentId) {
        fetchQuestionSet(data.contentId);
      }
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
      navigate("/admin/content-flags");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionSet = async (contentId) => {
    try {
      setLoadingQuestions(true);
      const data = await questionSetsService.getSetById(contentId);
      setQuestionSet(data);
    } catch (err) {
      console.error('Failed to fetch question set:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSendToExpert = async () => {
    if (!adminNote.trim()) {
      toast.showError(t("admin.contentFlagDetail.enterNoteForExpert"));
      return;
    }

    try {
      setProcessing(true);
      await contentFlagsService.adminReview(id, {
        action: "SendToExpert",
        adminNote: adminNote.trim(),
      });
      
      toast.showSuccess(t("admin.contentFlagDetail.sentToExpertSuccess"));
      fetchFlag();
      setAdminNote("");
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDismiss = async () => {
    if (!adminNote.trim()) {
      toast.showError(t("admin.contentFlagDetail.enterDismissReason"));
      return;
    }

    try {
      setProcessing(true);
      await contentFlagsService.adminReview(id, {
        action: "Dismiss",
        adminNote: adminNote.trim(),
      });
      
      toast.showSuccess(t("admin.contentFlagDetail.dismissSuccess"));
      fetchFlag();
      setAdminNote("");
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
    } finally {
      setProcessing(false);
    }
  };

  const handleResolve = async () => {
    try {
      setProcessing(true);
      await contentFlagsService.resolveFlag(id, {
        resolutionNote: resolutionNote.trim(),
      });
      
      toast.showSuccess(t("admin.contentFlagDetail.resolveSuccess"));
      setShowResolveModal(false);
      fetchFlag();
      setResolutionNote("");
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">{t("admin.common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!flag) return null;

  const getStatusBadge = (status) => {
    const badges = {
      Pending: "bg-yellow-100 text-yellow-700",
      SentToExpert: "bg-purple-100 text-purple-700",
      ExpertResponded: "bg-indigo-100 text-indigo-700",
      Resolved: "bg-green-100 text-green-700",
      Dismissed: "bg-gray-100 text-gray-700",
    };
    return badges[status] || badges.Pending;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="secondary" onClick={() => navigate("/admin/content-flags")}>
            ← {t("admin.contentFlagDetail.backToList")}
          </Button>
        </div>

        {/* Flag Info */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t("admin.contentFlagDetail.title", { id: flag.id.slice(-8) })}
            </h1>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadge(flag.status)}`}>
              {flag.status}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("admin.contentFlags.reporter")}:</label>
              <p className="text-gray-900 dark:text-gray-100 mt-1">
                {flag.reportedBy?.fullName} ({flag.reportedBy?.email})
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("admin.contentFlags.reason")}:</label>
              <p className="text-gray-900 dark:text-gray-100 mt-1">{flag.reason}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("admin.contentFlagDetail.description")}:</label>
              <p className="text-gray-900 dark:text-gray-100 mt-1 whitespace-pre-wrap">{flag.description}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("admin.contentFlagDetail.reportDate")}:</label>
              <p className="text-gray-900 dark:text-gray-100 mt-1">{formatDate(flag.createdAt)}</p>
            </div>

            {flag.assignedExpert && (
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("admin.contentFlagDetail.assignedExpert")}:</label>
                <p className="text-gray-900 dark:text-gray-100 mt-1">
                  {flag.assignedExpert.fullName} ({flag.assignedExpert.email})
                </p>
              </div>
            )}

            {flag.adminNote && (
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("admin.contentFlags.adminNote")}:</label>
                <p className="text-gray-900 dark:text-gray-100 mt-1 whitespace-pre-wrap">{flag.adminNote}</p>
              </div>
            )}

            {flag.expertResponse && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <label className="text-sm font-medium text-blue-900 dark:text-blue-300">{t("admin.contentFlagDetail.expertResponse")}:</label>
                <p className="text-blue-800 dark:text-blue-200 mt-2 whitespace-pre-wrap">{flag.expertResponse}</p>
                {flag.expertRespondedAt && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    {formatDate(flag.expertRespondedAt)}
                  </p>
                )}
              </div>
            )}

            {flag.resolutionNote && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <label className="text-sm font-medium text-green-900 dark:text-green-300">{t("admin.contentFlagDetail.conclusion")}:</label>
                <p className="text-green-800 dark:text-green-200 mt-2 whitespace-pre-wrap">{flag.resolutionNote}</p>
              </div>
            )}
          </div>
        </div>

        {/* Question Set Content */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            {t("admin.contentFlagDetail.questionSetContent")}
          </h2>

          {loadingQuestions ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">{t("admin.contentFlagDetail.loadingQuestions")}</p>
            </div>
          ) : questionSet ? (
            <>
              <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {questionSet.title}
                </h3>
                {questionSet.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{questionSet.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>{t("admin.contentFlagDetail.totalQuestions")}: <strong>{questionSet.questions?.length || 0}</strong></span>
                  <span>•</span>
                  <span>{t("admin.contentFlagDetail.timeLimit")}: <strong>{questionSet.timeLimit || 0} {t("admin.contentFlagDetail.minutes")}</strong></span>
                </div>
              </div>

              {questionSet.questions && questionSet.questions.length > 0 ? (
                <div className="space-y-6">
                  {questionSet.questions.map((question, index) => (
                    <div key={question.id || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-gray-900 dark:text-gray-100 font-medium mb-3">
                            {question.questionText}
                          </p>

                          {/* Options */}
                          <div className="space-y-2 mb-3">
                            {question.options?.map((option, optIndex) => {
                              // Use correctAnswerIndex field
                              const isCorrect = question.correctAnswerIndex === optIndex;
                              return (
                                <div
                                  key={optIndex}
                                  className={`p-3 rounded-lg border-2 transition-all ${
                                    isCorrect
                                      ? 'bg-green-100 dark:bg-green-900/40 border-green-600 dark:border-green-500 shadow-md'
                                      : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600'
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                                      isCorrect
                                        ? 'bg-green-600 text-white shadow-sm'
                                        : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                                    }`}>
                                      {String.fromCharCode(65 + optIndex)}
                                    </span>
                                    <span className={`flex-1 ${
                                      isCorrect
                                        ? 'text-green-900 dark:text-green-50 font-semibold text-base'
                                        : 'text-gray-600 dark:text-gray-400'
                                    }`}>
                                      {option}
                                    </span>
                                    {isCorrect && (
                                      <div className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                          <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                        {t("admin.contentFlagDetail.correct")}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Explanation */}
                          {question.explanation && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                              <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
                                💡 {t("admin.contentFlagDetail.explanation")}:
                              </p>
                              <p className="text-sm text-blue-800 dark:text-blue-200">
                                {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  {t("admin.contentFlagDetail.noQuestions")}
                </p>
              )}
            </>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              {t("admin.contentFlagDetail.cannotLoadContent")}
            </p>
          )}
        </div>

        {/* Actions */}
        {flag.status === "Pending" && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t("admin.contentFlagDetail.processReport")}
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("admin.contentFlagDetail.note")}
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder={t("admin.contentFlagDetail.notePlaceholder")}
                rows={4}
                maxLength={1000}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 resize-none"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                {adminNote.length}/1000
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleSendToExpert}
                disabled={processing || !adminNote.trim()}
                className="flex-1"
              >
                {processing ? t("admin.common.processing") : t("admin.contentFlagDetail.sendToExpert")}
              </Button>
              <Button
                variant="secondary"
                onClick={handleDismiss}
                disabled={processing || !adminNote.trim()}
                className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
              >
                {processing ? t("admin.common.processing") : t("admin.contentFlags.dismiss")}
              </Button>
            </div>
          </div>
        )}

        {(flag.status === "ExpertResponded" || flag.status === "SentToExpert") && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t("admin.contentFlagDetail.markAsResolved")}
            </h2>
            
            {!showResolveModal ? (
              <Button
                variant="primary"
                onClick={() => setShowResolveModal(true)}
              >
                {t("admin.contentFlagDetail.markResolvedBtn")}
              </Button>
            ) : (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("admin.contentFlagDetail.resolutionNoteLabel")}
                  </label>
                  <textarea
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder={t("admin.contentFlagDetail.resolutionNotePlaceholder")}
                    rows={3}
                    maxLength={1000}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 resize-none"
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    onClick={handleResolve}
                    disabled={processing}
                  >
                    {processing ? t("admin.common.processing") : t("admin.common.confirm")}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowResolveModal(false)}
                    disabled={processing}
                  >
                    {t("admin.common.cancel")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContentFlagDetailPage;
