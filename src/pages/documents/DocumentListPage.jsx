/**
 * DocumentListPage Component
 * Display and manage documents for a subject
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import DocumentCard from "@/components/documents/DocumentCard";
import DocumentUpload from "@/components/documents/DocumentUpload";
import { documentsService, subjectsService } from "@/services/api";
function DocumentListPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  // State
  const [subject, setSubject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [error, setError] = useState("");

  // Load documents
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load subject
        const subjectData = await subjectsService.getSubjectById(subjectId);
        setSubject(subjectData);

        // Load documents
        const documentsData = await documentsService.getDocumentsBySubject(subjectId);
        setDocuments(documentsData.documents || documentsData);
      } catch (err) {
        setError(err.response?.data?.message || "Không thể tải danh sách tài liệu");
      } finally {
        setLoading(false);
      }
    };

    if (subjectId) {
      loadData();
    }
  }, [subjectId]);

  // Handle upload success
  const handleUploadSuccess = (newDocument) => {
    setDocuments((prev) => [newDocument, ...prev]);
    setShowUploadModal(false);
  };

  // Handle delete document
  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) {
      return;
    }

    try {
      await documentsService.deleteDocument(documentId);
      setDocuments((prev) => prev.filter((doc) => doc._id !== documentId));
    } catch (err) {
      alert(err.response?.data?.message || "Không thể xóa tài liệu");
    }
  };

  // Handle generate summary
  const handleGenerateSummary = async (documentId) => {
    try {
      await documentsService.generateDocumentSummary(documentId);
      alert("Đang tạo tóm tắt... Bạn sẽ nhận được thông báo khi hoàn tất.");
    } catch (err) {
      alert(err.response?.data?.message || "Không thể tạo tóm tắt");
    }
  };

  if (loading) {
    return (
      <div className="document-list-page loading">
        <div className="spinner"></div>
        <p>Đang tải tài liệu...</p>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="document-list-page error">
        <p>Không tìm thấy môn học</p>
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="document-list-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>📚 Tài liệu - {subject.name}</h1>
          <p className="subtitle">Quản lý tài liệu học tập của môn học</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)}>+ Upload tài liệu</Button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3>Chưa có tài liệu nào</h3>
          <p>Upload tài liệu đầu tiên để bắt đầu học tập</p>
          <Button onClick={() => setShowUploadModal(true)}>+ Upload tài liệu</Button>
        </div>
      ) : (
        <div className="documents-grid">
          {documents.map((document) => (
            <DocumentCard
              key={document._id}
              document={document}
              onDelete={() => handleDeleteDocument(document._id)}
              onGenerateSummary={() => handleGenerateSummary(document._id)}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <Modal isOpen={true} onClose={() => setShowUploadModal(false)} title="Upload tài liệu mới">
          <DocumentUpload
            subjectId={subjectId}
            onUploadSuccess={handleUploadSuccess}
            onCancel={() => setShowUploadModal(false)}
          />
        </Modal>
      )}
    </div>
  );
}

export default DocumentListPage;
