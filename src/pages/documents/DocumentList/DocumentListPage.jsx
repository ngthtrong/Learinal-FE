/**
 * Document List Page
 * Display list of uploaded documents for a subject
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import documentsService from "@/services/api/documents.service";
import subjectsService from "@/services/api/subjects.service";
import Button from "@/components/common/Button";
import "./DocumentListPage.css";

function DocumentListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subjectId = searchParams.get("subjectId");

  const [documents, setDocuments] = useState([]);
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (subjectId) {
      fetchSubjectAndDocuments();
    } else {
      setError("Vui lòng chọn môn học");
      setLoading(false);
    }
  }, [subjectId]);

  const fetchSubjectAndDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch subject details
      const subjectData = await subjectsService.getSubjectById(subjectId);
      setSubject(subjectData);
      
      // Backend chưa có API list documents
      // Hiển thị thông báo và cho phép upload
      setDocuments([]);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải thông tin môn học");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = () => {
    navigate(`/documents/upload?subjectId=${subjectId}`);
  };

  const handleViewDocument = (docId) => {
    navigate(`/documents/${docId}`);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Uploading: { text: "Đang tải lên", className: "status-uploading" },
      Processing: { text: "Đang xử lý", className: "status-processing" },
      Completed: { text: "Hoàn tất", className: "status-completed" },
      Error: { text: "Lỗi", className: "status-error" },
    };
    return statusMap[status] || { text: status, className: "" };
  };

  const getFileIcon = (fileType) => {
    const icons = {
      ".pdf": "📄",
      ".docx": "📝",
      ".txt": "📃",
    };
    return icons[fileType] || "📎";
  };

  if (loading) {
    return (
      <div className="document-list-page">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="document-list-page">
        <div className="error-message">{error}</div>
        <Button onClick={() => navigate("/subjects")}>Quay lại môn học</Button>
      </div>
    );
  }

  return (
    <div className="document-list-page">
      <div className="page-header">
        <div className="header-left">
          <Button variant="secondary" onClick={() => navigate("/subjects")}>
            ← Quay lại
          </Button>
          <div className="header-title">
            <h1>Tài liệu: {subject?.subjectName}</h1>
            {subject?.description && (
              <p className="subject-description">{subject.description}</p>
            )}
          </div>
        </div>
        <Button onClick={handleUploadDocument}>+ Tải lên tài liệu</Button>
      </div>

      {documents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>Chưa có tài liệu nào</h3>
          <p>Tải lên tài liệu đầu tiên để bắt đầu học tập</p>
          <Button onClick={handleUploadDocument}>Tải lên tài liệu</Button>
        </div>
      ) : (
        <div className="documents-grid">
          {documents.map((doc) => {
            const statusBadge = getStatusBadge(doc.status);
            return (
              <div key={doc.id} className="document-card">
                <div className="document-icon">{getFileIcon(doc.fileType)}</div>
                <div className="document-content">
                  <h3 className="document-name">{doc.originalFileName}</h3>
                  <div className="document-meta">
                    <span className="file-size">{doc.fileSize} MB</span>
                    <span className={`status-badge ${statusBadge.className}`}>
                      {statusBadge.text}
                    </span>
                  </div>
                  <div className="document-date">
                    {new Date(doc.uploadedAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
                <div className="document-actions">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => handleViewDocument(doc.id)}
                    disabled={doc.status !== "Completed"}
                  >
                    Chi tiết
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DocumentListPage;
