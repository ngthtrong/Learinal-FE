import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import questionSetsService from "@/services/api/questionSets.service";
import quizAttemptsService from "@/services/api/quizAttempts.service";
import Button from "@/components/common/Button";
import { useToast, ReportContentModal, PremiumRequiredModal } from "@/components/common";
import { getErrorMessage } from "@/utils/errorHandler";
import { contentFlagsService } from "@/services/api";
import { formatDate, formatTime } from "@/utils/formatters";
import { useAuth } from "@/contexts/AuthContext";
import { validationRequestsService } from "@/services/api";
import { Footer } from "@/components/layout";
function QuestionSetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [questionSet, setQuestionSet] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const { user } = useAuth();
  
  const [requestingReview, setRequestingReview] = useState(false);
  const [reviewRequested, setReviewRequested] = useState(false);
  const [currentReview, setCurrentReview] = useState(null); // active or last review
  const [completedReview, setCompletedReview] = useState(null); // latest completed review
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionResponse, setRevisionResponse] = useState("");
  const [requestingRevision, setRequestingRevision] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [myReports, setMyReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [expertFlags, setExpertFlags] = useState([]); // Flags assigned to expert
  const [expertResponse, setExpertResponse] = useState("");
  const [respondingToFlag, setRespondingToFlag] = useState(null);
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [isReportsCollapsed, setIsReportsCollapsed] = useState(false);

  // Debug logging after all state declarations
  console.log('🔍 QuestionSetDetailPage state:', { 
    userId: user?.id, 
    questionSetId: questionSet?.id, 
    questionSetUserId: questionSet?.userId,
    reviewRequested,
    currentReview: currentReview?.id,
    completedReview: completedReview?.id,
    status: questionSet?.status
  });

  useEffect(() => {
    fetchQuestionSet();
    fetchAttempts();
    fetchValidationRequest();
    fetchMyReports();
    fetchExpertFlags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  const fetchValidationRequest = async () => {
    try {
      const data = await validationRequestsService.list({ page: 1, pageSize: 20, setId: id });
      const items = data?.items || data?.data || [];
      if (!items.length) return;
      // IMPORTANT: Double-check setId matches to handle backend filter issues
      const matchingItems = items.filter(r => String(r.setId) === String(id));
      if (!matchingItems.length) return;
      const active = matchingItems.find((r) => r.status !== "Completed");
      const completed = matchingItems
        .filter((r) => r.status === "Completed")
        .sort(
          (a, b) =>
            new Date(b.completionTime || b.updatedAt || b.createdAt) -
            new Date(a.completionTime || a.updatedAt || a.createdAt)
        )[0];
      if (active) {
        setCurrentReview(active);
        setReviewRequested(true);
      }
      if (completed) {
        setCompletedReview(completed);
      }
    } catch (e) {
      /* ignore */
    }
  };

  const fetchQuestionSet = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching question set with ID:', id);
      const data = await questionSetsService.getSetById(id);
      console.log('✅ Question set loaded:', data);
      
      // Backend already checked premium requirement and set _premiumRequired flag
      if (data._premiumRequired) {
        console.log('⚠️ Premium required for this question set');
        setShowPremiumModal(true);
        setLoading(false);
        return;
      }
      
      setQuestionSet(data);
    } catch (err) {
      console.error('❌ Error loading question set:', err);
      const message = getErrorMessage(err);
      toast.showError(message);
      // Redirect back to quiz list instead of public page
      setTimeout(() => navigate("/quiz"), 2000);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReports = async () => {
    try {
      setLoadingReports(true);
      // Don't filter by status - show all reports including resolved/dismissed for history
      const data = await contentFlagsService.listFlags({
        contentId: id,
        contentType: 'QuestionSet',
      });
      console.log('📋 Fetched myReports:', data);
      setMyReports(data.items || []);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setMyReports([]);
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchExpertFlags = async () => {
    try {
      console.log('🔍 Fetching expert flags for contentId:', id);
      const flags = await contentFlagsService.getFlagsByContent([id]);
      console.log('✅ Received flags:', flags);
      setExpertFlags(flags || []);
    } catch (err) {
      console.error('❌ Failed to fetch expert flags:', err);
      setExpertFlags([]);
    }
  };

  const handleExpertRespond = async (flagId) => {
    if (!expertResponse.trim()) {
      toast.showError("Vui lòng nhập phản hồi");
      return;
    }

    try {
      setSubmittingResponse(true);
      await contentFlagsService.expertRespond(flagId, { response: expertResponse });
      toast.showSuccess("Đã gửi phản hồi. Admin và người báo cáo sẽ nhận được thông báo.");
      setExpertResponse("");
      setRespondingToFlag(null);
      fetchExpertFlags(); // Refresh
      fetchMyReports(); // Refresh
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
    } finally {
      setSubmittingResponse(false);
    }
  };

  const fetchAttempts = async () => {
    try {
      setLoadingAttempts(true);
      const response = await quizAttemptsService.getAttemptsByQuestionSet(id);
      const attemptsData = response.data || response || [];
      setAttempts(Array.isArray(attemptsData) ? attemptsData : []);
    } catch (err) {
      console.error("Failed to fetch attempts:", err);
      setAttempts([]);
    } finally {
      setLoadingAttempts(false);
    }
  };

  const handleStartQuiz = () => {
    navigate(`/quiz/start/${id}`);
  };

  const handleViewAttempt = (attemptId) => {
    navigate(`/quiz/result/${attemptId}`);
  };

  const handleContinueAttempt = (attemptId) => {
    navigate(`/quiz/take/${attemptId}`);
  };

  const canRequestReview = () => {
    if (!questionSet || !user) {
      console.log('🔍 canRequestReview: No questionSet or user');
      return false;
    }
    // questionSet.userId có thể là object {_id, name, email} hoặc string ID
    const questionSetOwnerId = typeof questionSet.userId === 'object' 
      ? (questionSet.userId._id || questionSet.userId.id) 
      : questionSet.userId;
    const isOwner = String(questionSetOwnerId) === String(user.id);
    const blockedStatuses = ["Validated", "Public"];
    const result = isOwner && !reviewRequested && !blockedStatuses.includes(questionSet.status);
    console.log('🔍 canRequestReview:', {
      questionSetOwnerId,
      userId: user.id,
      isOwner,
      reviewRequested,
      status: questionSet.status,
      blockedStatuses,
      result
    });
    return result;
  };

  const handleRequestReview = async () => {
    if (!canRequestReview()) return;
    setRequestingReview(true);
    try {
      const res = await questionSetsService.requestReview(id);
      toast.showSuccess(res?.message || "Đã gửi yêu cầu kiểm duyệt");
      // refresh validation request list to capture real status (PendingAssignment)
      await fetchValidationRequest();
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.showError(msg);
      if (err?.response?.status === 409) {
        await fetchValidationRequest();
      }
    } finally {
      setRequestingReview(false);
    }
  };

  const canRequestRevision = () => {
    if (!completedReview || !user || !questionSet) return false;
    const isOwner = String(questionSet.userId || questionSet.user?.id) === String(user.id);
    return isOwner && completedReview.status === "Completed" && !reviewRequested;
  };

  const handleRequestRevision = async () => {
    if (!revisionResponse.trim()) {
      toast.showError("Vui lòng nhập phản hồi của bạn");
      return;
    }
    if (revisionResponse.trim().length < 10) {
      toast.showError("Phản hồi phải có ít nhất 10 ký tự");
      return;
    }
    if (revisionResponse.trim().length > 1000) {
      toast.showError("Phản hồi không được vượt quá 1000 ký tự");
      return;
    }

    setRequestingRevision(true);
    try {
      await validationRequestsService.requestRevision(completedReview.id, {
        learnerResponse: revisionResponse.trim(),
      });
      toast.showSuccess("Đã gửi yêu cầu kiểm duyệt lại thành công");
      setShowRevisionModal(false);
      setRevisionResponse("");
      await fetchValidationRequest();
      await fetchQuestionSet();
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.showError(msg);
    } finally {
      setRequestingRevision(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="inline-block w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!questionSet) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-slate-800">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500"><path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l3.58-3.58c.94-.94.94-2.48 0-3.42L9 5Z"></path><path d="M6 9.01V9"></path><path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19"></path></svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Không tìm thấy bộ câu hỏi</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Bộ câu hỏi này có thể đã bị xóa hoặc không tồn tại</p>
          <Button onClick={() => navigate(-1)}>← Quay lại</Button>
        </div>
      </div>
    );
  }

  const completedAttempts = attempts.filter((a) => a.isCompleted);
  const avgScore =
    completedAttempts.length > 0
      ? completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length
      : 0;
  const bestScore =
    completedAttempts.length > 0 ? Math.max(...completedAttempts.map((a) => a.score || 0)) : 0;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 rounded-lg px-4 sm:px-6 py-4 sm:py-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <Button variant="secondary" onClick={() => navigate("/quiz")}>
              ← Quay lại
            </Button>
            
            {questionSet.status !== "Processing" && (
              <Button onClick={handleStartQuiz} variant="primary" size="large" className="w-full sm:w-auto">
                <span className="inline-flex items-center gap-2 justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                  Bắt đầu làm bài
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Question Set Info */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 min-w-0 break-words">
              {questionSet.title}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                  questionSet.status === "Draft"
                    ? "bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300"
                    : questionSet.status === "Processing"
                    ? "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300"
                    : questionSet.status === "Validated"
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                    : questionSet.status === "Published"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : questionSet.status === "Public"
                    ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                    : "bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {questionSet.status === "Draft" && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  )}
                  {questionSet.status === "Processing" && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                  )}
                  {questionSet.status === "Published" && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  )}
                  {questionSet.status === "Public" && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                  )}
                  {questionSet.status === "Draft"
                    ? "Bản nháp"
                    : questionSet.status === "Processing"
                    ? "Đang xử lý"
                    : questionSet.status === "Validated"
                    ? "Đã xác thực"
                    : questionSet.status === "Published"
                    ? "Đã xuất bản"
                    : questionSet.status === "Public"
                    ? "Công khai"
                    : questionSet.status}
                </span>
              </span>
              {questionSet.isShared && (
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                  Đã chia sẻ
                </span>
              )}
              {reviewRequested && currentReview && (
                <span
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                    currentReview.status === "PendingAssignment"
                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                      : currentReview.status === "Assigned"
                      ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                      : currentReview.status === "Completed"
                      ? "bg-success-100 dark:bg-green-900/30 text-success-700 dark:text-green-300"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {currentReview.status === "PendingAssignment" && (
                    <span className="inline-flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      Chờ gán chuyên gia
                    </span>
                  )}
                  {currentReview.status === "Assigned" && (
                    <span className="inline-flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                      Đã gán chuyên gia
                    </span>
                  )}
                  {currentReview.status === "Completed" && (
                    <span className="inline-flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Đã hoàn tất
                    </span>
                  )}
                  {!["PendingAssignment", "Assigned", "Completed"].includes(currentReview.status) &&
                    currentReview.status}
                </span>
              )}
              {!reviewRequested && completedReview && (
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-success-100 dark:bg-green-900/30 text-success-700 dark:text-green-300">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Đã kiểm duyệt
                </span>
              )}
              {canRequestReview() && (
                <Button
                  variant="outline"
                  disabled={requestingReview}
                  onClick={handleRequestReview}
                  className="w-full sm:w-auto"
                >
                  {requestingReview ? "Đang gửi..." : "Yêu cầu kiểm duyệt"}
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4 bg-primary-50 dark:bg-primary-900/30 rounded-lg p-3 sm:p-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-800/50">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {questionSet.questionCount || questionSet.questions?.length || 0}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Câu hỏi</div>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 bg-secondary-50 dark:bg-secondary-900/30 rounded-lg p-3 sm:p-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg bg-secondary-100 dark:bg-secondary-800/50">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6 text-secondary-600 dark:text-secondary-400"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {attempts.length}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Lượt làm</div>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 bg-success-50 dark:bg-success-900/30 rounded-lg p-3 sm:p-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg bg-success-100 dark:bg-success-800/50">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6 text-success-600 dark:text-success-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {bestScore.toFixed(1)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Điểm cao nhất</div>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 bg-warning-50 dark:bg-warning-900/30 rounded-lg p-3 sm:p-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg bg-warning-100 dark:bg-warning-800/50">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6 text-warning-600 dark:text-warning-400"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {avgScore.toFixed(1)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Điểm trung bình</div>
              </div>
            </div>
          </div>

          {questionSet.description && (
            <div className="border-t border-gray-200 dark:border-slate-700 pt-4 sm:pt-6 mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Mô tả
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {questionSet.description}
              </p>
            </div>
          )}

          {questionSet.isShared && (
            <div className="border-t border-gray-200 dark:border-slate-700 pt-4 sm:pt-6 mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                Link chia sẻ
              </h3>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/question-sets/${questionSet.id}`}
                  className="flex-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded px-3 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onClick={(e) => e.target.select()}
                />
                <Button
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/question-sets/${questionSet.id}`
                    );
                    toast.showSuccess("Đã sao chép link!");
                  }}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    Sao chép
                  </span>
                </Button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                Chia sẻ link này để người khác có thể xem và làm bài tập
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-slate-700 pt-4">
            <span className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Tạo: {formatDate(questionSet.createdAt)}
            </span>
            {questionSet.updatedAt !== questionSet.createdAt && (
              <span className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                Cập nhật: {formatDate(questionSet.updatedAt)}
              </span>
            )}
            {completedReview && (
              <div className={`mt-2 rounded-lg p-3 sm:p-4 ${
                completedReview.decision === "Rejected"
                  ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                  : "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-2">
                  <div className={`text-sm sm:text-base font-semibold flex items-center gap-2 ${
                    completedReview.decision === "Rejected"
                      ? "text-red-700 dark:text-red-300"
                      : "text-green-700 dark:text-green-300"
                  }`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    Chuyên gia:{" "}
                    {completedReview.expertName || completedReview.expertId || "—"}
                  </div>
                  <div className={`text-xs ${
                    completedReview.decision === "Rejected"
                      ? "text-red-700 dark:text-red-400"
                      : "text-green-700 dark:text-green-400"
                  }`}>
                    Hoàn thành:{" "}
                    {formatDate(completedReview.completionTime || completedReview.updatedAt)}
                  </div>
                </div>
                <div className={`text-sm mb-2 ${
                  completedReview.decision === "Rejected"
                    ? "text-gray-900 dark:text-gray-100"
                    : "text-gray-700 dark:text-gray-300"
                }`}>
                  <span className="font-medium">Kết quả: </span>
                  {completedReview.decision === "Approved" && (
                    <span className="inline-flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Phê duyệt
                    </span>
                  )}
                  {completedReview.decision === "Rejected" && (
                    <span className="inline-flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      Từ chối
                    </span>
                  )}
                  {!completedReview.decision && "—"}
                </div>
                {completedReview.feedback && (
                  <div className={`text-sm whitespace-pre-line mb-3 ${
                    completedReview.decision === "Rejected"
                      ? "text-gray-900 dark:text-gray-100"
                      : "text-gray-700 dark:text-gray-300"
                  }`}>
                    <span className="font-medium">Nhận xét:</span> {completedReview.feedback}
                  </div>
                )}
                {canRequestRevision() && (
                  <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => setShowRevisionModal(true)}
                      className="w-full"
                    >
                      <span className="inline-flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                        Yêu cầu kiểm duyệt lại
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Expert: Pending Reports Section */}
        {expertFlags.length > 0 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h2 className="text-xl font-bold text-orange-900 dark:text-orange-100">
                Yêu cầu xử lý từ Admin ({expertFlags.length})
              </h2>
            </div>
            <p className="text-sm text-orange-800 dark:text-orange-200 mb-4">
              Admin đã gửi yêu cầu cho bạn xem xét và xử lý các báo cáo sau. Vui lòng kiểm tra, sửa lỗi (nếu cần), và gửi phản hồi.
            </p>

            {expertFlags.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 text-center">
                <svg className="w-12 h-12 text-green-500 dark:text-green-400 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-gray-600 dark:text-gray-300 font-medium">Không có yêu cầu nào đang chờ xử lý</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Bạn đã hoàn thành tất cả các yêu cầu</p>
              </div>
            ) : (
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
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                        }`}>
                          {hasResponded ? 'Đã phản hồi - Chờ Admin xác nhận' : 'Cần xử lý'}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Báo cáo lúc: {formatDate(flag.createdAt)}
                        </p>
                        {flag.reportedBy && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Người báo cáo: {flag.reportedBy.fullName || flag.reportedBy.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Report Details */}
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-3 border border-red-200 dark:border-red-800">
                      <div className="flex items-start gap-2 mb-2">
                        <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-red-900 dark:text-red-100 mb-1">
                            Loại báo cáo: <span className="font-normal text-red-700 dark:text-red-300">{flag.reason}</span>
                          </p>
                          <div className="text-sm text-red-800 dark:text-red-200">
                            <p className="font-semibold mb-1">Nội dung báo cáo từ learner:</p>
                            <p className="whitespace-pre-line bg-white dark:bg-slate-800 rounded p-2 border border-red-200 dark:border-red-700">
                              {flag.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {flag.adminNote && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 mb-3">
                        <p className="text-xs font-medium text-amber-900 dark:text-amber-300 mb-1">
                          Ghi chú từ Admin:
                        </p>
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          {flag.adminNote}
                        </p>
                      </div>
                    )}

                    {flag.expertResponse && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                              <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <span>Phản hồi đã được gửi đến Admin và người báo cáo. Admin sẽ xem xét và đánh dấu hoàn thành.</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {!hasResponded && (
                      <div className="mt-4">
                        {!isResponding ? (
                          <Button
                            variant="primary"
                            size="small"
                            onClick={() => setRespondingToFlag(flag.id)}
                          >
                            Gửi phản hồi
                          </Button>
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Phản hồi của bạn *
                              </label>
                              <textarea
                                value={expertResponse}
                                onChange={(e) => setExpertResponse(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 resize-none"
                                placeholder="Mô tả những thay đổi bạn đã thực hiện hoặc lý do không thể sửa..."
                                maxLength={2000}
                              />
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {expertResponse.length}/2000 ký tự
                              </p>
                            </div>
                            <div className="flex gap-2">
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
            )}
          </div>
        )}

        {/* Content Reports Section - Only show for Expert content */}
        {questionSet?.userId?.role === 'Expert' && (
        <div className="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 rounded-lg mb-6">
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Báo cáo vấn đề
              </h2>
              <button
                onClick={() => setIsReportsCollapsed(!isReportsCollapsed)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={isReportsCollapsed ? "Mở rộng" : "Thu gọn"}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transform transition-transform ${isReportsCollapsed ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowReportModal(true)}
            >
              <span className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Gửi báo cáo mới
              </span>
            </Button>
          </div>

          {!isReportsCollapsed && (
            <div className="px-6 pb-6">
            {loadingReports ? (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-4">Đang tải...</p>
              </div>
            ) : myReports.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Bạn chưa gửi báo cáo nào cho bộ đề này
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {myReports.map((report) => {
                  const statusColors = {
                    Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
                    SentToExpert: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
                    ExpertResponded: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
                    Resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
                    Dismissed: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
                  };
                  
                  const statusLabels = {
                    Pending: 'Đang chờ xử lý',
                    SentToExpert: 'Đã gửi cho Expert',
                    ExpertResponded: 'Expert đã phản hồi',
                    Resolved: 'Đã giải quyết',
                    Dismissed: 'Đã từ chối',
                  };

                  return (
                    <div key={report.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[report.status]}`}>
                            {statusLabels[report.status]}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {formatDate(report.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Lý do: {report.reason}
                        </p>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {report.description}
                      </p>

                      {report.adminNote && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 mb-2">
                          <p className="text-xs font-medium text-amber-900 dark:text-amber-300 mb-1">
                            Ghi chú từ Admin:
                          </p>
                          <p className="text-sm text-amber-800 dark:text-amber-200">
                            {report.adminNote}
                          </p>
                        </div>
                      )}

                      {report.expertResponse && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-2">
                          <p className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-1">
                            Phản hồi từ Expert:
                          </p>
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            {report.expertResponse}
                          </p>
                        </div>
                      )}

                      {report.resolutionNote && (
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                          <p className="text-xs font-medium text-green-900 dark:text-green-300 mb-1">
                            Kết luận:
                          </p>
                          <p className="text-sm text-green-800 dark:text-green-200">
                            {report.resolutionNote}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            </div>
          )}
        </div>
        )}

        {/* Quiz Attempts History */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-medium border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path><path d="M8 8h8M8 12h8"></path><path d="M16 2v20"></path></svg>
              Lịch sử làm bài
            </h2>
            <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
              {completedAttempts.length}/{attempts.length} hoàn thành
            </span>
          </div>

          {loadingAttempts ? (
            <div className="p-6 sm:p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin mb-3"></div>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Đang tải lịch sử...</p>
            </div>
          ) : attempts.length > 0 ? (
            <>
              {/* Mobile Card View */}
              <div className="block sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
                {attempts.map((attempt, index) => {
                  const duration = attempt.completedAt
                    ? Math.floor(
                        (new Date(attempt.completedAt) - new Date(attempt.startedAt)) / 1000 / 60
                      )
                    : null;
                  return (
                    <div
                      key={attempt.id}
                      className={`p-4 ${
                        attempt.isCompleted ? "" : "bg-gray-50 dark:bg-gray-900/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Lần #{attempts.length - index}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            attempt.isCompleted
                              ? "bg-success-100 dark:bg-green-900/30 text-success-800 dark:text-green-300"
                              : "bg-warning-100 dark:bg-yellow-900/30 text-warning-800 dark:text-yellow-300"
                          }`}
                        >
                          {attempt.isCompleted ? "Hoàn thành" : "Đang làm"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Điểm: </span>
                          {attempt.isCompleted ? (
                            <span className="font-bold text-primary-600 dark:text-primary-400">
                              {attempt.score?.toFixed(1) || 0}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Thời gian: </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {duration !== null ? `${duration} phút` : "-"}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500 dark:text-gray-400">Bắt đầu: </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {formatTime(attempt.startedAt)}
                          </span>
                        </div>
                      </div>
                      {attempt.isCompleted ? (
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() => handleViewAttempt(attempt.id)}
                          className="w-full text-xs"
                        >
                          Xem kết quả
                        </Button>
                      ) : (
                        <Button
                          variant="success"
                          size="small"
                          onClick={() => handleContinueAttempt(attempt.id)}
                          className="w-full text-xs"
                        >
                          Tiếp tục làm
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Lần
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Điểm
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Bắt đầu
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Hoàn thành
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {attempts.map((attempt, index) => {
                    const duration = attempt.completedAt
                      ? Math.floor(
                          (new Date(attempt.completedAt) - new Date(attempt.startedAt)) / 1000 / 60
                        )
                      : null;
                    return (
                      <tr
                        key={attempt.id}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                          attempt.isCompleted ? "" : "bg-gray-50 dark:bg-gray-900/50"
                        }`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          #{attempts.length - index}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              attempt.isCompleted
                                ? "bg-success-100 dark:bg-green-900/30 text-success-800 dark:text-green-300"
                                : "bg-warning-100 dark:bg-yellow-900/30 text-warning-800 dark:text-yellow-300"
                            }`}
                          >
                            {attempt.isCompleted ? (
                              <span className="inline-flex items-center gap-1">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Hoàn thành
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                Đang làm
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {attempt.isCompleted ? (
                            <span className="text-base font-bold text-primary-600 dark:text-primary-400">
                              {attempt.score?.toFixed(1) || 0}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {formatTime(attempt.startedAt)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {attempt.completedAt ? (
                            formatTime(attempt.completedAt)
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {duration !== null ? (
                            `${duration} phút`
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {attempt.isCompleted ? (
                            <Button
                              variant="primary"
                              size="small"
                              onClick={() => handleViewAttempt(attempt.id)}
                              className="flex items-center gap-2"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              Xem kết quả
                            </Button>
                          ) : (
                            <Button
                              variant="success"
                              size="small"
                              onClick={() => handleContinueAttempt(attempt.id)}
                              className="flex items-center gap-2"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                />
                              </svg>
                              Tiếp tục làm
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </>
          ) : (
            <div className="p-6 sm:p-8 lg:p-12 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-slate-800">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500"><path d="M21.5 12H16c-.7 2-2 3-4 3s-3.3-1-4-3H2.5"></path><path d="M5.5 5.1L2 12v6c0 1.1.9 2 2 2h16a2 2 0 002-2v-6l-3.4-6.9A2 2 0 0016.8 4H7.2a2 2 0 00-1.8 1.1z"></path></svg>
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                Chưa có lượt làm bài nào. Hãy bắt đầu làm bài đầu tiên!
              </p>
              {questionSet.status !== "Processing" && (
              <Button onClick={handleStartQuiz}>
                <span className="inline-flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                  Bắt đầu làm bài
                </span>
              </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Revision Request Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                  Yêu cầu kiểm duyệt lại
                </h3>
                <button
                  onClick={() => {
                    setShowRevisionModal(false);
                    setRevisionResponse("");
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  <span>
                    Nếu bạn không hài lòng với kết quả kiểm duyệt, hãy cho chúng tôi biết lý do. Bộ câu hỏi của bạn sẽ được chuyên gia xem xét lại.
                  </span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phản hồi của bạn <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={revisionResponse}
                  onChange={(e) => setRevisionResponse(e.target.value)}
                  placeholder="Vui lòng mô tả lý do bạn muốn yêu cầu kiểm duyệt lại (10-1000 ký tự)..."
                  rows="5"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100 resize-none text-sm sm:text-base"
                />
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Ít nhất 10 ký tự
                  </span>
                  <span
                    className={`${
                      revisionResponse.length > 1000
                        ? "text-red-500"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {revisionResponse.length}/1000
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-slate-700 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowRevisionModal(false);
                  setRevisionResponse("");
                }}
                disabled={requestingRevision}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={handleRequestRevision}
                disabled={requestingRevision || !revisionResponse.trim() || revisionResponse.length < 10 || revisionResponse.length > 1000}
              >
                {requestingRevision ? (
                  <span className="inline-flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                    Đang gửi...
                  </span>
                ) : (
                  "Gửi yêu cầu"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Report Content Modal */}
      <ReportContentModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSuccess={() => {
          setShowReportModal(false);
          fetchMyReports();
        }}
        contentType="QuestionSet"
        contentId={id}
        contentTitle={questionSet?.title}
      />

      {/* Premium Required Modal */}
      {showPremiumModal && (
        <PremiumRequiredModal
          onClose={() => {
            setShowPremiumModal(false);
            navigate("/quiz");
          }}
          onUpgrade={() => navigate("/subscriptions/plans")}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default QuestionSetDetailPage;
