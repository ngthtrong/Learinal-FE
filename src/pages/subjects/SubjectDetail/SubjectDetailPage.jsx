import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import subjectsService from "@/services/api/subjects.service";
import documentsService from "@/services/api/documents.service";
import questionSetsService from "@/services/api/questionSets.service";
import Button from "@/components/common/Button";
import { Modal, useToast } from "@/components/common";
import { SubjectForm } from "@/components/subjects";
import { DocumentUpload } from "@/components/documents";
import { GenerateQuizModal } from "@/components/questionSets";
import { getErrorMessage } from "@/utils/errorHandler";
import { formatDate } from "@/utils/formatters";
import { useNotifications } from "@/contexts/NotificationContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Footer } from "@/components/layout";
import DocumentIcon from "@/components/icons/DocumentIcon";
import QuizIcon from "@/components/icons/QuizIcon";
import UploadIcon from "@/components/icons/UploadIcon";
import PenIcon from "@/components/icons/PenIcon";
import SubjectsIcon from "@/components/icons/SubjectsIcon";
import BookIcon from "@/components/icons/BookIcon";

function SubjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useLanguage();
  const { fetchNotifications } = useNotifications();

  const LEVEL_LABELS = {
    secondary: { label: t("subjects.levelLabels.secondary"), color: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
    highschool: { label: t("subjects.levelLabels.highschool"), color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
    university: { label: t("subjects.levelLabels.university"), color: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' },
  };
  const [subject, setSubject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [questionSets, setQuestionSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [loadingQuestionSets, setLoadingQuestionSets] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isGenerateQuizModalOpen, setIsGenerateQuizModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [deleteDocModal, setDeleteDocModal] = useState(null); // { id, name }
  const [deleteQuizModal, setDeleteQuizModal] = useState(null); // { id, title }
  const [deletingDoc, setDeletingDoc] = useState(false);
  const [deletingQuiz, setDeletingQuiz] = useState(false);

  useEffect(() => {
    console.log("=== SUBJECT DETAIL PAGE MOUNTED ===");
    console.log("Subject ID from params:", id);
    fetchSubject();
    fetchDocuments();
    fetchQuestionSets();
    
    // Cleanup polling interval on unmount
    return () => {
      if (pollingInterval) {
        console.log("[SubjectDetailPage] Cleaning up polling interval");
        clearInterval(pollingInterval);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    console.log("=== QUESTION SETS STATE CHANGED ===");
    console.log("Current questionSets:", questionSets);
    console.log("Length:", questionSets.length);
  }, [questionSets]);

  const fetchSubject = async () => {
    try {
      setLoading(true);
      const data = await subjectsService.getSubjectById(id);
      console.log("Subject data from API:", data);
      console.log("Subject level:", data?.level);
      setSubject(data);
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
      // Navigate back if subject not found
      if (err.response?.status === 404) {
        setTimeout(() => navigate("/subjects"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoadingDocuments(true);
      console.log("Fetching documents for subject:", id);
      const response = await documentsService.getDocumentsBySubject(id);
      console.log("Documents API response:", response);

      // Handle different response structures
      const docs = response.data || response || [];
      console.log("Parsed documents:", docs);
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      console.error("Error details:", err.response?.data);
      // Don't show error toast, just set empty array
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const fetchQuestionSets = async () => {
    try {
      setLoadingQuestionSets(true);
      console.log("=== FETCHING QUESTION SETS ===");
      console.log("Subject ID:", id);
      const response = await questionSetsService.getQuestionSetsBySubject(id);
      console.log("Question sets API response:", response);
      console.log("Response type:", typeof response);
      console.log("Response.data:", response.data);

      // Handle different response structures
      const sets = response.data || response || [];
      console.log("Parsed question sets:", sets);
      console.log("Is array?", Array.isArray(sets));
      console.log("Sets length:", sets.length);

      setQuestionSets(Array.isArray(sets) ? sets : []);
      console.log("=== QUESTION SETS UPDATED ===");
    } catch (err) {
      console.error("Failed to fetch question sets:", err);
      console.error("Error details:", err.response?.data);
      console.error("Error status:", err.response?.status);
      // Don't show error toast, just set empty array
      setQuestionSets([]);
    } finally {
      setLoadingQuestionSets(false);
    }
  };

  const handleEditSubmit = async (formData) => {
    try {
      setSaving(true);
      const updated = await subjectsService.updateSubject(id, formData);
      setSubject(updated);
      setIsEditModalOpen(false);
      toast.showSuccess(t("subjectDetail.updateSuccess"));
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
      throw err; // Let SubjectForm handle the error state
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await subjectsService.deleteSubject(id);
      toast.showSuccess(t("subjectDetail.deleteSubjectSuccess"));
      setTimeout(() => navigate("/subjects"), 500);
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
      setDeleting(false);
    }
  };

  const handleUploadSuccess = () => {
    toast.showSuccess(t("subjectDetail.uploadSuccess"));
    setIsUploadModalOpen(false);
    // Refresh subject to update document count and reload documents list
    fetchSubject();
    fetchDocuments();
  };

  const handleGenerateQuiz = async (data) => {
    try {
      setGenerating(true);
      console.log("Generating quiz with data:", data);
      const result = await questionSetsService.generateQuestionSet(data);
      console.log("Generate quiz result:", result);

      toast.showSuccess(
        t("subjectDetail.generateQuizRequest", { title: data.title })
      );
      setIsGenerateQuizModalOpen(false);

      // Refresh question sets list to show the new quiz
      fetchQuestionSets();
      
      // Clear any existing polling interval
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
      
      // Poll for notifications and question sets periodically
      // Quiz generation can take 30-60 seconds, so we poll every 10 seconds for up to 2 minutes
      let pollCount = 0;
      const maxPolls = 12; // 12 * 10s = 2 minutes
      
      const interval = setInterval(() => {
        pollCount++;
        console.log(`[SubjectDetailPage] Polling notifications and question sets (${pollCount}/${maxPolls})`);
        
        // Fetch both notifications and question sets
        fetchNotifications();
        fetchQuestionSets();
        
        // Stop polling after max attempts
        if (pollCount >= maxPolls) {
          console.log("[SubjectDetailPage] Stopped polling - max attempts reached");
          clearInterval(interval);
          setPollingInterval(null);
        }
      }, 10000); // Poll every 10 seconds
      
      // Save interval to state for cleanup
      setPollingInterval(interval);
      
      // Also do an immediate check after 3 seconds
      setTimeout(() => {
        console.log("[SubjectDetailPage] Initial check for notifications");
        fetchNotifications();
        fetchQuestionSets();
      }, 3000);
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteDocument = async (documentId, documentName) => {
    setDeleteDocModal({ id: documentId, name: documentName });
  };

  const confirmDeleteDocument = async () => {
    if (!deleteDocModal) return;
    
    try {
      setDeletingDoc(true);
      await documentsService.deleteDocument(deleteDocModal.id);
      toast.showSuccess(t("subjectDetail.deleteDocSuccess"));
      setDeleteDocModal(null);
      // Refresh documents list
      fetchDocuments();
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
    } finally {
      setDeletingDoc(false);
    }
  };

  const handleDeleteQuestionSet = async (questionSetId, questionSetTitle) => {
    setDeleteQuizModal({ id: questionSetId, title: questionSetTitle });
  };

  const confirmDeleteQuestionSet = async () => {
    if (!deleteQuizModal) return;
    
    try {
      setDeletingQuiz(true);
      await questionSetsService.deleteSet(deleteQuizModal.id);
      toast.showSuccess(t("subjectDetail.deleteQuizSuccess"));
      setDeleteQuizModal(null);
      // Refresh question sets list
      fetchQuestionSets();
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
    } finally {
      setDeletingQuiz(false);
    }
  };

  const formatFileSize = (sizeMB) => {
    if (!sizeMB && sizeMB !== 0) return "";
    // Backend already returns size in MB
    return `${sizeMB} MB`;
  };

  const renderTopicTree = (topics, level = 0) => {
    if (!topics || topics.length === 0) return null;

    return (
      <ul className={`topic-list level-${level}`}>
        {topics.map((topic, index) => (
          <li key={index} className="topic-item">
            <div className="topic-content">
              <span className="topic-name">{topic.topicName}</span>
            </div>
            {topic.childTopics && topic.childTopics.length > 0 && (
              <div className="topic-children">{renderTopicTree(topic.childTopics, level + 1)}</div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
        <div className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-8 animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Subject Not Found
  if (!subject) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="text-4xl sm:text-6xl mb-4">🔍</div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
              {t("subjectDetail.notFound")}
            </h2>
            <p className="text-gray-600 text-center mb-6">
              {t("subjectDetail.notFoundDesc")}
            </p>
            <Button onClick={() => navigate(-1)}>{t("subjectDetail.back")}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 rounded-lg px-4 sm:px-6 py-4 sm:py-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              {t("subjectDetail.back")}
            </Button>
            <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
              <Button onClick={() => setIsUploadModalOpen(true)} className="text-sm sm:text-base">
                <UploadIcon size={16} strokeWidth={2} className="inline-block sm:mr-1" />
                <span className="hidden sm:inline">{t("subjectDetail.uploadDoc")}</span>
                <span className="sm:hidden">{t("subjectDetail.uploadDocShort")}</span>
              </Button>
              <Button onClick={() => setIsGenerateQuizModalOpen(true)} className="text-sm sm:text-base">
                <QuizIcon size={16} strokeWidth={2} className="inline-block sm:mr-1" />
                <span className="hidden sm:inline">{t("subjectDetail.createQuiz")}</span>
                <span className="sm:hidden">{t("subjectDetail.createQuizShort")}</span>
              </Button>
              <Button variant="secondary" onClick={() => setIsEditModalOpen(true)} className="text-sm sm:text-base">
                <PenIcon size={16} strokeWidth={2} className="inline-block sm:mr-1" />
                <span className="hidden sm:inline">{t("subjectDetail.edit")}</span>
                <span className="sm:hidden">{t("subjectDetail.editShort")}</span>
              </Button>
              <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)} className="text-sm sm:text-base">
                <svg className="inline-block sm:mr-1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                <span className="hidden sm:inline">{t("subjectDetail.delete")}</span>
                <span className="sm:hidden">{t("subjectDetail.delete")}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-6">
        {/* Subject Info */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {subject.subjectName}
            </h1>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {subject.level && LEVEL_LABELS[subject.level] && (
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${LEVEL_LABELS[subject.level].color}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                  </svg>
                  {LEVEL_LABELS[subject.level].label}
                </span>
              )}
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-medium">
                <DocumentIcon size={18} strokeWidth={2} />
                {documents.length} {t("subjectDetail.documentsCount", { count: "" }).replace("{count} ", "")}
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-50 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 rounded-lg text-sm font-medium">
                <QuizIcon size={18} strokeWidth={2} />
                {questionSets.length} {t("subjectDetail.questionSetsCount", { count: "" }).replace("{count} ", "")}
              </span>
            </div>
          </div>

          {subject.description && (
            <div className="mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <PenIcon size={18} strokeWidth={2} className="sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400" />
                {t("subjectDetail.description")}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {subject.description}
              </p>
            </div>
          )}

          {subject.summary && (
            <div className="mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <SubjectsIcon size={18} stroke={2} className="sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400" />
                {t("subjectDetail.summary")}
              </h3>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {subject.summary}
              </div>
            </div>
          )}

          {subject.tableOfContents && subject.tableOfContents.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <SubjectsIcon size={18} stroke={2} className="sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400" />
                {t("subjectDetail.tableOfContents", { count: subject.tableOfContents.length })}
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                {renderTopicTree(subject.tableOfContents)}
              </div>
            </div>
          )}
        </div>

        {/* Documents Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-6">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <DocumentIcon size={20} strokeWidth={2} className="sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
              {t("subjectDetail.documents", { count: documents.length })}
            </h3>
            <Button size="small" onClick={() => setIsUploadModalOpen(true)} className="w-full sm:w-auto">
              {t("subjectDetail.addDocument")}
            </Button>
          </div>

          {loadingDocuments ? (
            <div className="text-center py-8 text-gray-600">
              <p>{t("subjectDetail.loadingDocuments")}</p>
            </div>
          ) : documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  {/* Decorative blurred blob */}
                  <div className="pointer-events-none absolute -top-6 -right-6 w-24 h-24 bg-primary-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity" />

                  <div onClick={() => navigate(`/documents/${doc.id}`)}>
                    {/* Icon - Top */}
                    <div className="mb-3">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                        <DocumentIcon size={28} strokeWidth={2} className="text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {doc.originalFileName || doc.fileName}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            doc.status === "Uploading"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : doc.status === "Processing"
                              ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
                              : doc.status === "Completed"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : doc.status === "Error"
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-400"
                          }`}
                        >
                          {doc.status === "Uploading"
                            ? t("subjectDetail.docStatus.uploading")
                            : doc.status === "Processing"
                            ? t("subjectDetail.docStatus.processing")
                            : doc.status === "Completed"
                            ? t("subjectDetail.docStatus.completed")
                            : doc.status === "Error"
                            ? t("subjectDetail.docStatus.error")
                            : doc.status}
                        </span>
                        {doc.fileSize > 0 && (
                          <span className="text-gray-700 dark:text-gray-600">
                            {formatFileSize(doc.fileSize)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-500 mt-1">
                        {formatDate(doc.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDocument(doc.id, doc.originalFileName || doc.fileName);
                    }}
                    title={t("subjectDetail.deleteDocTitle")}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>

                  {/* Hover underline accent */}
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary-500 group-hover:w-full transition-all" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 bg-gray-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-700">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <DocumentIcon size={32} strokeWidth={2} className="sm:w-10 sm:h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 px-4">
                {t("subjectDetail.noDocuments")}
              </p>
              <Button onClick={() => setIsUploadModalOpen(true)}>
                <UploadIcon size={18} strokeWidth={2} className="inline-block mr-1" />
                {t("subjectDetail.uploadFirstDoc")}
              </Button>
            </div>
          )}
        </div>

        {/* Question Sets Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-6">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <QuizIcon size={20} strokeWidth={2} className="sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
              {t("subjectDetail.questionSets", { count: questionSets.length })}
            </h3>
            <Button onClick={() => setIsGenerateQuizModalOpen(true)} className="w-full sm:w-auto">{t("subjectDetail.addQuestionSet")}</Button>
          </div>

          {loadingQuestionSets ? (
            <div className="text-center py-8 text-gray-600">
              <p>{t("subjectDetail.loadingQuestionSets")}</p>
            </div>
          ) : questionSets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {questionSets.map((set) => (
                <div
                  key={set.id}
                  className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  {/* Decorative blurred blob */}
                  <div className="pointer-events-none absolute -top-6 -right-6 w-24 h-24 bg-primary-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity" />

                  <div onClick={() => navigate(`/question-sets/${set.id}`)}>
                    <div className="mb-3">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 pr-8 mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {set.title}
                      </h4>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            set.status === "Draft"
                              ? "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-400"
                              : set.status === "Processing"
                              ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
                              : set.status === "Validated"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : set.status === "Published"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : set.status === "Public"
                              ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-400"
                          }`}
                        >
                          {set.status === "Draft"
                            ? t("subjectDetail.quizStatus.draft")
                            : set.status === "Processing"
                            ? t("subjectDetail.quizStatus.processing")
                            : set.status === "Validated"
                            ? t("subjectDetail.quizStatus.validated")
                            : set.status === "Published"
                            ? t("subjectDetail.quizStatus.published")
                            : set.status === "Public"
                            ? t("subjectDetail.quizStatus.public")
                            : set.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-700 dark:text-gray-400">
                      <span>{(set.questions?.length || set.questionCount || 0)} {t("subjectDetail.questionsCount", { count: "" }).replace("{count} ", "")}</span>
                      {set.isShared && <span>• {t("subjectDetail.shared")}</span>}
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {formatDate(set.createdAt)}
                      </span>
                    </div>
                  </div>
                  <button
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteQuestionSet(set.id, set.title);
                    }}
                    title={t("subjectDetail.deleteQuizTitle")}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>

                  {/* Hover underline accent */}
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary-500 group-hover:w-full transition-all" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 bg-gray-50 dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-700">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <QuizIcon size={32} strokeWidth={2} className="sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 px-4">
                {t("subjectDetail.noQuestionSets")}
              </p>
              <Button onClick={() => setIsGenerateQuizModalOpen(true)}>
                <QuizIcon size={18} strokeWidth={2} className="inline-block mr-1" />
                {t("subjectDetail.createQuiz")}
              </Button>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <span>{t("subjectDetail.createdAt", { date: formatDate(subject.createdAt) })}</span>
            {subject.updatedAt !== subject.createdAt && (
              <span>• {t("subjectDetail.updatedAt", { date: formatDate(subject.updatedAt) })}</span>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t("subjectDetail.editModalTitle")}
      >
        <SubjectForm
          initialData={{
            subjectName: subject.subjectName,
            description: subject.description || "",
            level: subject.level || "",
          }}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditModalOpen(false)}
          loading={saving}
          submitText={t("subjectDetail.saveChanges")}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t("subjectDetail.deleteModalTitle")}
      >
        <div className="delete-confirmation">
          <h3 className="dark:text-gray-100">{t("subjectDetail.deleteConfirm")}</h3>
          <div className="subject-info">
            <p className="dark:text-gray-200">
              <strong>{subject.subjectName}</strong>
            </p>
            {subject.documentCount > 0 && (
              <p className="warning-text dark:text-yellow-400">
                {t("subjectDetail.deleteDocWarning", { count: subject.documentCount })}
              </p>
            )}
            {subject.questionSetCount > 0 && (
              <p className="warning-text dark:text-yellow-400">
                {t("subjectDetail.deleteQuizWarning", { count: subject.questionSetCount })}
              </p>
            )}
          </div>
          <p className="danger-text dark:text-red-400">{t("subjectDetail.deleteNoUndo")}</p>
          <div className="modal-actions mt-6 flex justify-start gap-4">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
            >
              {t("subjectDetail.cancel")}
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              {t("subjectDetail.confirmDelete")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title={t("subjectDetail.uploadModalTitle")}
      >
        <DocumentUpload
          subjectId={id}
          onUploadSuccess={handleUploadSuccess}
          onCancel={() => setIsUploadModalOpen(false)}
        />
      </Modal>

      {/* Generate Quiz Modal */}
      <GenerateQuizModal
        isOpen={isGenerateQuizModalOpen}
        onClose={() => setIsGenerateQuizModalOpen(false)}
        subject={subject}
        onGenerate={handleGenerateQuiz}
        loading={generating}
      />

      {/* Delete Document Confirmation Modal */}
      <Modal
        isOpen={!!deleteDocModal}
        onClose={() => setDeleteDocModal(null)}
        title={t("subjectDetail.deleteDocModalTitle")}
        confirmText={t("subjectDetail.confirmDelete")}
        cancelText={t("subjectDetail.cancel")}
        onConfirm={confirmDeleteDocument}
        variant="danger"
        loading={deletingDoc}
      >
        <p className="text-gray-700 dark:text-gray-300">
          {t("subjectDetail.deleteDocConfirm", { name: deleteDocModal?.name })}
        </p>
      </Modal>

      {/* Delete Quiz Confirmation Modal */}
      <Modal
        isOpen={!!deleteQuizModal}
        onClose={() => setDeleteQuizModal(null)}
        title={t("subjectDetail.deleteQuizModalTitle")}
        confirmText={t("subjectDetail.confirmDelete")}
        cancelText={t("subjectDetail.cancel")}
        onConfirm={confirmDeleteQuestionSet}
        variant="danger"
        loading={deletingQuiz}
      >
        <p className="text-gray-700 dark:text-gray-300">
          {t("subjectDetail.deleteQuizConfirm", { name: deleteQuizModal?.title })}
        </p>
      </Modal>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default SubjectDetailPage;
