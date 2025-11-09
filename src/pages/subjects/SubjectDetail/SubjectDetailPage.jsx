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
    <div className="subject-detail-page">
      {/* Header */}
      <div className="page-header">
        <Button variant="secondary" onClick={() => navigate("/subjects")}>
          ← Quay lại
        </Button>
        <div className="header-actions">
          <Button onClick={() => setIsUploadModalOpen(true)}>📤 Tải lên tài liệu</Button>
          <Button onClick={() => setIsGenerateQuizModalOpen(true)}>🎯 Tạo đề thi</Button>
          <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>
            ✏️ Chỉnh sửa
          </Button>
          <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
            🗑️ Xóa
          </Button>
        </div>
      </div>

      {/* Subject Info */}
      <div className="subject-info-card">
        <div className="subject-header">
          <h1>{subject.subjectName}</h1>
          <div className="subject-badges">
            <span className="badge badge-documents">📄 {documents.length} tài liệu</span>
            <span className="badge badge-questions">❓ {questionSets.length} bộ câu hỏi</span>
          </div>
        </div>

        {subject.description && (
          <div className="subject-section">
            <h3 className="section-title">📝 Mô tả</h3>
            <p className="subject-description">{subject.description}</p>
          </div>
        )}

        {subject.summary && (
          <div className="subject-section">
            <h3 className="section-title">📊 Tóm tắt</h3>
            <div className="subject-summary">{subject.summary}</div>
          </div>
        )}

        {subject.tableOfContents && subject.tableOfContents.length > 0 && (
          <div className="subject-section">
            <h3 className="section-title">📚 Nội dung ({subject.tableOfContents.length} chủ đề)</h3>
            <div className="table-of-contents">{renderTopicTree(subject.tableOfContents)}</div>
          </div>
        )}

        {/* Documents Section */}
        <div className="subject-section">
          <div className="section-header">
            <h3 className="section-title">📄 Tài liệu ({documents.length})</h3>
            <Button size="small" onClick={() => setIsUploadModalOpen(true)}>
              + Thêm tài liệu
            </Button>
          </div>

          {loadingDocuments ? (
            <div className="documents-loading">
              <p>Đang tải tài liệu...</p>
            </div>
          ) : documents.length > 0 ? (
            <div className="documents-grid">
              {documents.map((doc) => (
                <div key={doc.id} className="document-card">
                  <div
                    className="document-card-content"
                    onClick={() => navigate(`/documents/${doc.id}`)}
                  >
                    <div className="document-icon">
                      {doc.fileType === ".pdf" ? "📄" : doc.fileType === ".docx" ? "📝" : "📃"}
                    </div>
                    <div className="document-info">
                      <h4 className="document-name">{doc.originalFileName || doc.fileName}</h4>
                      <div className="document-meta">
                        <span className={`document-status status-${doc.status?.toLowerCase()}`}>
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
                          <span className="document-size">{formatFileSize(doc.fileSize)}</span>
                        )}
                      </div>
                      <p className="document-date">📅 {formatDate(doc.uploadedAt)}</p>
                    </div>
                  </div>
                  <button
                    className="delete-document-btn"
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
            <div className="empty-documents">
              <p>📭 Chưa có tài liệu nào. Hãy tải lên tài liệu đầu tiên!</p>
              <Button onClick={() => setIsUploadModalOpen(true)}>📤 Tải lên tài liệu</Button>
            </div>
          )}
        </div>

        {/* Question Sets Section */}
        <div className="subject-section">
          <div className="section-header">
            <h3 className="section-title">❓ Bộ câu hỏi ({questionSets.length})</h3>
            <Button onClick={() => setIsGenerateQuizModalOpen(true)}>🎯 Tạo đề thi mới</Button>
          </div>

          {loadingQuestionSets ? (
            <div className="question-sets-loading">
              <p>Đang tải bộ câu hỏi...</p>
            </div>
          ) : questionSets.length > 0 ? (
            <div className="question-sets-grid">
              {questionSets.map((set) => (
                <div key={set.id} className="question-set-card">
                  <div
                    className="question-set-card-content"
                    onClick={() => navigate(`/question-sets/${set.id}`)}
                  >
                    <div className="question-set-header">
                      <h4 className="question-set-title">{set.title}</h4>
                      <span className={`question-set-status status-${set.status?.toLowerCase()}`}>
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
                    <div className="question-set-meta">
                      <span>📊 {set.questionCount || 0} câu hỏi</span>
                      {set.isShared && <span>🔗 Đã chia sẻ</span>}
                      <span>📅 {formatDate(set.createdAt)}</span>
                    </div>
                  </div>
                  <button
                    className="delete-question-set-btn"
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
            <div className="empty-question-sets">
              <p>📭 Chưa có bộ câu hỏi nào. Hãy tạo đề thi đầu tiên!</p>
              <Button onClick={() => setIsGenerateQuizModalOpen(true)}>🎯 Tạo đề thi</Button>
            </div>
          )}
        </div>

        <div className="subject-meta">
          <span>📅 Tạo: {formatDate(subject.createdAt)}</span>
          {subject.updatedAt !== subject.createdAt && (
            <span>🔄 Cập nhật: {formatDate(subject.updatedAt)}</span>
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
          <div className="warning-icon">⚠️</div>
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
          <div className="modal-actions">
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
