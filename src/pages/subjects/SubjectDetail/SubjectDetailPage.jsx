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
      <ul className={`pl-4 ${level > 0 ? "border-l border-gray-200 ml-2" : ""}`}>
        {topics.map((topic, index) => (
          <li key={index} className="relative py-2">
            <div className="flex items-start gap-3 group">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded bg-gray-100 text-xs font-medium text-gray-600 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors mt-0.5">
                {topic.topicId}
              </span>
              <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                {topic.topicName}
              </span>
            </div>
            {topic.childTopics && topic.childTopics.length > 0 && (
              <div className="mt-1">{renderTopicTree(topic.childTopics, level + 1)}</div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className="subject-detail-page">
        <div className="detail-skeleton">
          <div className="skeleton-header">
            <div className="skeleton-line" style={{ width: "100px" }}></div>
            <div className="skeleton-line" style={{ width: "200px" }}></div>
          </div>
          <div className="skeleton-title"></div>
          <div className="skeleton-body">
            <div className="skeleton-line"></div>
            <div className="skeleton-line" style={{ width: "80%" }}></div>
            <div className="skeleton-line" style={{ width: "60%" }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Subject Not Found
  if (!subject) {
    return (
      <div className="subject-detail-page">
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h2>Không tìm thấy môn học</h2>
          <p>Môn học này có thể đã bị xóa hoặc không tồn tại</p>
          <Button onClick={() => navigate("/subjects")}>← Quay lại danh sách</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/subjects")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          ← Quay lại danh sách
        </Button>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2"
          >
            ✏️ Chỉnh sửa
          </Button>
          <Button
            variant="danger-outline"
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-2"
          >
            🗑️ Xóa
          </Button>
        </div>
      </div>

      {/* Subject Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{subject.subjectName}</h1>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                📄 {documents.length} tài liệu
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-sm font-medium">
                ❓ {questionSets.length} bộ câu hỏi
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 min-w-[200px]">
            <div className="text-sm text-gray-500 text-right">
              📅 Tạo: {formatDate(subject.createdAt)}
            </div>
            {subject.updatedAt !== subject.createdAt && (
              <div className="text-sm text-gray-500 text-right">
                🔄 Cập nhật: {formatDate(subject.updatedAt)}
              </div>
            )}
          </div>
        </div>

        {subject.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📝 Mô tả</h3>
            <p className="text-gray-600 leading-relaxed">{subject.description}</p>
          </div>
        )}

        {subject.summary && (
          <div className="mb-6 bg-gray-50 rounded-xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Tóm tắt nội dung</h3>
            <div className="prose prose-sm max-w-none text-gray-600">{subject.summary}</div>
          </div>
        )}

        {subject.tableOfContents && subject.tableOfContents.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📚 Mục lục ({subject.tableOfContents.length} chủ đề)
            </h3>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {renderTopicTree(subject.tableOfContents)}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Documents Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">📄 Tài liệu ({documents.length})</h3>
            <Button size="small" onClick={() => setIsUploadModalOpen(true)}>
              + Thêm tài liệu
            </Button>
          </div>

          {loadingDocuments ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
              <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-500">Đang tải tài liệu...</p>
            </div>
          ) : documents.length > 0 ? (
            <div className="grid gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="group bg-white rounded-xl p-4 border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                  onClick={() => navigate(`/documents/${doc.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xl">
                      {doc.fileType === ".pdf" ? "📄" : doc.fileType === ".docx" ? "📝" : "📃"}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                        {doc.originalFileName || doc.fileName}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>•</span>
                        <span>{formatDate(doc.uploadedAt)}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            doc.status === "Completed"
                              ? "bg-green-50 text-green-700"
                              : doc.status === "Processing"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {doc.status === "Uploading"
                            ? "Đang tải"
                            : doc.status === "Processing"
                            ? "Đang xử lý"
                            : doc.status === "Completed"
                            ? "Hoàn tất"
                            : doc.status === "Error"
                            ? "Lỗi"
                            : doc.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
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
            <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">Chưa có tài liệu nào</p>
              <Button variant="outline" onClick={() => setIsUploadModalOpen(true)}>
                📤 Tải lên ngay
              </Button>
            </div>
          )}
        </div>

        {/* Question Sets Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              ❓ Bộ câu hỏi ({questionSets.length})
            </h3>
            <Button size="small" onClick={() => setIsGenerateQuizModalOpen(true)}>
              🎯 Tạo đề thi
            </Button>
          </div>

          {loadingQuestionSets ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
              <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-500">Đang tải bộ câu hỏi...</p>
            </div>
          ) : questionSets.length > 0 ? (
            <div className="grid gap-4">
              {questionSets.map((set) => (
                <div
                  key={set.id}
                  className="group bg-white rounded-xl p-4 border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                  onClick={() => navigate(`/question-sets/${set.id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                        {set.title}
                      </h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          set.status === "Published"
                            ? "bg-green-50 text-green-700"
                            : set.status === "Draft"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {set.status === "Draft"
                          ? "Nháp"
                          : set.status === "Processing"
                          ? "Đang xử lý"
                          : set.status === "Published"
                          ? "Đã xuất bản"
                          : set.status === "Public"
                          ? "Công khai"
                          : set.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        📊 {set.questionCount || 0} câu
                      </span>
                      <span className="flex items-center gap-1">
                        📅 {formatDate(set.createdAt)}
                      </span>
                      {set.isShared && (
                        <span className="text-blue-600 flex items-center gap-1">🔗 Đã chia sẻ</span>
                      )}
                    </div>
                  </div>
                  <button
                    className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
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
            <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">Chưa có bộ câu hỏi nào</p>
              <Button variant="outline" onClick={() => setIsGenerateQuizModalOpen(true)}>
                🎯 Tạo đề thi ngay
              </Button>
            </div>
          )}
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
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            ⚠️
          </div>
          <h3 className="text-lg font-bold text-center text-gray-900 mb-2">
            Bạn có chắc chắn muốn xóa môn học này?
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="font-medium text-gray-900 mb-2 text-center">{subject.subjectName}</p>
            {(subject.documentCount > 0 || subject.questionSetCount > 0) && (
              <div className="text-sm text-red-600 space-y-1 text-center">
                {subject.documentCount > 0 && <p>• {subject.documentCount} tài liệu sẽ bị xóa</p>}
                {subject.questionSetCount > 0 && (
                  <p>• {subject.questionSetCount} bộ câu hỏi sẽ bị xóa</p>
                )}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 text-center mb-6">
            Hành động này không thể hoàn tác. Vui lòng cân nhắc kỹ trước khi xóa.
          </p>
          <div className="flex items-center gap-3 justify-end">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)} disabled={deleting}>
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
