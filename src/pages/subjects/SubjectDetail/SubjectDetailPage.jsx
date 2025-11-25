/**
 * Subject Detail Page
 * View, edit, and delete subject with documents list
 */

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

function SubjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
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

  useEffect(() => {
    console.log("=== SUBJECT DETAIL PAGE MOUNTED ===");
    console.log("Subject ID from params:", id);
    fetchSubject();
    fetchDocuments();
    fetchQuestionSets();
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
      toast.showSuccess("Cập nhật môn học thành công!");
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
      toast.showSuccess("Xóa môn học thành công!");
      setTimeout(() => navigate("/subjects"), 500);
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
      setDeleting(false);
    }
  };

  const handleUploadSuccess = () => {
    toast.showSuccess("Tải lên tài liệu thành công!");
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
        `Đã gửi yêu cầu tạo đề thi "${data.title}"! Hệ thống đang xử lý, bạn sẽ nhận được thông báo khi hoàn tất.`
      );
      setIsGenerateQuizModalOpen(false);

      // Refresh question sets list to show the new quiz
      fetchQuestionSets();
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteDocument = async (documentId, documentName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài liệu "${documentName}"?`)) {
      return;
    }

    try {
      await documentsService.deleteDocument(documentId);
      toast.showSuccess("Xóa tài liệu thành công!");
      // Refresh documents list
      fetchDocuments();
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
    }
  };

  const handleDeleteQuestionSet = async (questionSetId, questionSetTitle) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa đề thi "${questionSetTitle}"?`)) {
      return;
    }

    try {
      await questionSetsService.deleteSet(questionSetId);
      toast.showSuccess("Xóa đề thi thành công!");
      // Refresh question sets list
      fetchQuestionSets();
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
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
              <span className="topic-id">{topic.topicId}: </span>
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
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50">
        <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 animate-pulse">
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
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Không tìm thấy môn học
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Môn học này có thể đã bị xóa hoặc không tồn tại
            </p>
            <Button onClick={() => navigate(-1)}>← Quay lại</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg px-6 py-6 mb-6">
          <div className="flex items-center justify-between">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              ← Quay lại
            </Button>
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsUploadModalOpen(true)}>📤 Tải tài liệu</Button>
              <Button onClick={() => setIsGenerateQuizModalOpen(true)}>🎯 Tạo đề thi</Button>
              <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>
                ✏️ Chỉnh sửa
              </Button>
              <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
                🗑️ Xóa
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-6">
        {/* Subject Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {subject.subjectName}
            </h1>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-medium">
                📄 {documents.length} tài liệu
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-50 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300 rounded-lg text-sm font-medium">
                ❓ {questionSets.length} bộ câu hỏi
              </span>
            </div>
          </div>

          {subject.description && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                📝 Mô tả
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {subject.description}
              </p>
            </div>
          )}

          {subject.summary && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                📊 Tóm tắt
              </h3>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {subject.summary}
              </div>
            </div>
          )}

          {subject.tableOfContents && subject.tableOfContents.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                📚 Nội dung ({subject.tableOfContents.length} chủ đề)
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                {renderTopicTree(subject.tableOfContents)}
              </div>
            </div>
          )}
        </div>

        {/* Documents Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              📄 Tài liệu ({documents.length})
            </h3>
            <Button size="small" onClick={() => setIsUploadModalOpen(true)}>
              + Thêm tài liệu
            </Button>
          </div>

          {loadingDocuments ? (
            <div className="text-center py-8 text-gray-600">
              <p>Đang tải tài liệu...</p>
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
                      <div className="text-4xl transform group-hover:scale-110 transition-transform">
                        {doc.fileType === ".pdf" ? "📄" : doc.fileType === ".docx" ? "📝" : "📃"}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {doc.originalFileName || doc.fileName}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span
                          className={`px-1 py-1 rounded-full ${
                            doc.status === "Uploading"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/60 dark:text-yellow-400"
                              : doc.status === "Processing"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-400"
                              : doc.status === "Completed"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-400"
                              : doc.status === "Error"
                              ? "bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800/60 dark:text-gray-400"
                          }`}
                        >
                          {doc.status === "Uploading"
                            ? "⏳ Đang tải"
                            : doc.status === "Processing"
                            ? "⚙️ Đang xử lý"
                            : doc.status === "Completed"
                            ? "✅ Hoàn tất"
                            : doc.status === "Error"
                            ? "❌ Lỗi"
                            : doc.status}
                        </span>
                        {doc.fileSize > 0 && (
                          <span className="text-gray-700 dark:text-gray-600">
                            {formatFileSize(doc.fileSize)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-500 mt-1">
                        📅 {formatDate(doc.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDocument(doc.id, doc.originalFileName || doc.fileName);
                    }}
                    title="Xóa tài liệu"
                  >
                    🗑️
                  </button>

                  {/* Hover underline accent */}
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary-500 group-hover:w-full transition-all" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-gray-600 mb-4">
                Chưa có tài liệu nào. Hãy tải lên tài liệu đầu tiên!
              </p>
              <Button onClick={() => setIsUploadModalOpen(true)}>
                📤 Tải lên tài liệu đầu tiên
              </Button>
            </div>
          )}
        </div>

        {/* Question Sets Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              ❓ Bộ câu hỏi ({questionSets.length})
            </h3>
            <Button onClick={() => setIsGenerateQuizModalOpen(true)}>+ Tạo đề thi</Button>
          </div>

          {loadingQuestionSets ? (
            <div className="text-center py-8 text-gray-600">
              <p>Đang tải bộ câu hỏi...</p>
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
                          className={`inline-flex items-center py-1 rounded-full text-xs font-medium ${
                            set.status === "Draft"
                              ? "bg-gray-100 text-gray-700 dark:bg-gray-800/60 dark:text-gray-400"
                              : set.status === "Processing"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-400"
                              : set.status === "Published"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-400"
                              : set.status === "Public"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800/60 dark:text-gray-400"
                          }`}
                        >
                          {set.status === "Draft"
                            ? "📝 Nháp"
                            : set.status === "Processing"
                            ? "⚙️ Đang xử lý"
                            : set.status === "Published"
                            ? "✅ Đã xuất bản"
                            : set.status === "Public"
                            ? "🌐 Công khai"
                            : set.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-700 dark:text-gray-400">
                      <span>📊 {set.questionCount || 0} câu hỏi</span>
                      {set.isShared && <span>🔗 Đã chia sẻ</span>}
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        📅 {formatDate(set.createdAt)}
                      </span>
                    </div>
                  </div>
                  <button
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteQuestionSet(set.id, set.title);
                    }}
                    title="Xóa đề thi"
                  >
                    🗑️
                  </button>

                  {/* Hover underline accent */}
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary-500 group-hover:w-full transition-all" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Chưa có bộ câu hỏi nào. Hãy tạo đề thi đầu tiên!
              </p>
              <Button onClick={() => setIsGenerateQuizModalOpen(true)}>🎯 Tạo đề thi</Button>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>📅 Tạo: {formatDate(subject.createdAt)}</span>
            {subject.updatedAt !== subject.createdAt && (
              <span>🔄 Cập nhật: {formatDate(subject.updatedAt)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Chỉnh sửa môn học"
      >
        <SubjectForm
          initialData={{
            subjectName: subject.subjectName,
            description: subject.description || "",
          }}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditModalOpen(false)}
          loading={saving}
          submitText="Lưu thay đổi"
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Xác nhận xóa môn học"
      >
        <div className="delete-confirmation">
          <h3 className="dark:text-gray-100">Bạn có chắc chắn muốn xóa môn học này?</h3>
          <div className="subject-info">
            <p className="dark:text-gray-200">
              <strong>{subject.subjectName}</strong>
            </p>
            {subject.documentCount > 0 && (
              <p className="warning-text dark:text-yellow-400">
                ⚠️ Môn học này có <strong>{subject.documentCount} tài liệu</strong>. Tất cả tài liệu
                sẽ bị xóa cùng.
              </p>
            )}
            {subject.questionSetCount > 0 && (
              <p className="warning-text dark:text-yellow-400">
                ⚠️ Môn học này có <strong>{subject.questionSetCount} bộ câu hỏi</strong>. Tất cả câu
                hỏi sẽ bị xóa cùng.
              </p>
            )}
          </div>
          <p className="danger-text dark:text-red-400">Hành động này không thể hoàn tác!</p>
          <div className="modal-actions mt-6 flex justify-start gap-4">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
            >
              Hủy
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              Xác nhận xóa
            </Button>
          </div>
        </div>
      </Modal>

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Tải lên tài liệu mới"
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

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 text-sm">© 2025 Learinal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default SubjectDetailPage;
