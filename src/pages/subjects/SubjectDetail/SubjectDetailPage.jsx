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

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const renderTopicTree = (topics, level = 0) => {
    if (!topics || topics.length === 0) return null;

    return (
      <ul className={`topic-list level-${level}`}>
        {topics.map((topic, index) => (
          <li key={index} className="topic-item">
            <div className="topic-content">
              <span className="topic-id">{topic.topicId}</span>
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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 animate-pulse">
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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy môn học</h2>
            <p className="text-gray-600 text-center mb-6">
              Môn học này có thể đã bị xóa hoặc không tồn tại
            </p>
            <Button onClick={() => navigate("/subjects")}>← Quay lại danh sách</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg px-6 py-6 mb-6">
          <div className="flex items-center justify-between">
            <Button variant="secondary" onClick={() => navigate("/subjects")}>
              ← Quay lại danh sách
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{subject.subjectName}</h1>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium">
                📄 {documents.length} tài liệu
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-50 text-secondary-700 rounded-lg text-sm font-medium">
                ❓ {questionSets.length} bộ câu hỏi
              </span>
            </div>
          </div>

          {subject.description && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">📝 Mô tả</h3>
              <p className="text-gray-700 leading-relaxed">{subject.description}</p>
            </div>
          )}

          {subject.summary && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">📊 Tóm tắt</h3>
              <div className="text-gray-700 leading-relaxed">{subject.summary}</div>
            </div>
          )}

          {subject.tableOfContents && subject.tableOfContents.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                📚 Nội dung ({subject.tableOfContents.length} chủ đề)
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {renderTopicTree(subject.tableOfContents)}
              </div>
            </div>
          )}
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-gray-900">
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
                  className="relative bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                >
                  <div onClick={() => navigate(`/documents/${doc.id}`)}>
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">
                        {doc.fileType === ".pdf" ? "📄" : doc.fileType === ".docx" ? "📝" : "📃"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {doc.originalFileName || doc.fileName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <span
                            className={`px-1 py-1 rounded-full ${
                              doc.status === "Uploading"
                                ? "bg-yellow-100 text-yellow-700"
                                : doc.status === "Processing"
                                ? "bg-blue-100 text-blue-700"
                                : doc.status === "Completed"
                                ? "bg-green-100 text-green-700"
                                : doc.status === "Error"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
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
                            <span className="text-gray-600">{formatFileSize(doc.fileSize)}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          📅 {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDocument(doc.id, doc.originalFileName || doc.fileName);
                    }}
                    title="Xóa tài liệu"
                  >
                    🗑️
                  </button>
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-gray-900">
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
                  className="relative bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                >
                  <div onClick={() => navigate(`/question-sets/${set.id}`)}>
                    <div className="mb-2">
                      <h4 className="font-medium text-gray-900 pr-8">{set.title}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-flex items-center py-1 rounded-full text-xs font-medium ${
                            set.status === "Draft"
                              ? "bg-gray-100 text-gray-700"
                              : set.status === "Processing"
                              ? "bg-blue-100 text-blue-700"
                              : set.status === "Published"
                              ? "bg-green-100 text-green-700"
                              : set.status === "Public"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gray-100 text-gray-700"
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
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span>📊 {set.questionCount || 0} câu hỏi</span>
                      {set.isShared && <span>🔗 Đã chia sẻ</span>}
                      <span className="text-xs text-gray-500">📅 {formatDate(set.createdAt)}</span>
                    </div>
                  </div>
                  <button
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteQuestionSet(set.id, set.title);
                    }}
                    title="Xóa đề thi"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-gray-600 mb-4">Chưa có bộ câu hỏi nào. Hãy tạo đề thi đầu tiên!</p>
              <Button onClick={() => setIsGenerateQuizModalOpen(true)}>🎯 Tạo đề thi</Button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4 text-sm text-gray-600">
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
          <h3>Bạn có chắc chắn muốn xóa môn học này?</h3>
          <div className="subject-info">
            <p>
              <strong>{subject.subjectName}</strong>
            </p>
            {subject.documentCount > 0 && (
              <p className="warning-text">
                ⚠️ Môn học này có <strong>{subject.documentCount} tài liệu</strong>. Tất cả tài liệu
                sẽ bị xóa cùng.
              </p>
            )}
            {subject.questionSetCount > 0 && (
              <p className="warning-text">
                ⚠️ Môn học này có <strong>{subject.questionSetCount} bộ câu hỏi</strong>. Tất cả câu
                hỏi sẽ bị xóa cùng.
              </p>
            )}
          </div>
          <p className="danger-text">Hành động này không thể hoàn tác!</p>
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
    </div>
  );
}

export default SubjectDetailPage;
