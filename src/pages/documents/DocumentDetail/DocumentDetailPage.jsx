/**
 * Document Detail Page
 * View document details and generated questions
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import documentsService from "@/services/api/documents.service";
import Button from "@/components/common/Button";
import "./DocumentDetailPage.css";

function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [document, setDocument] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("info"); // info, summary, text

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const docData = await documentsService.getDocumentById(id);
      setDocument(docData);
      
      // Fetch summary if document is completed
      if (docData.status === "Completed") {
        try {
          const summaryData = await documentsService.getDocumentSummary(id);
          setSummary(summaryData);
        } catch (err) {
          console.error("Failed to fetch summary:", err);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải thông tin tài liệu");
    } finally {
      setLoading(false);
    }
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
      <div className="document-detail-page">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="document-detail-page">
        <div className="error-message">{error}</div>
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="document-detail-page">
        <div className="error-message">Không tìm thấy tài liệu</div>
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
      </div>
    );
  }

  const statusBadge = getStatusBadge(document.status);

  return (
    <div className="document-detail-page">
      <div className="page-header">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          ← Quay lại
        </Button>
      </div>

      <div className="document-header">
        <div className="doc-icon-large">{getFileIcon(document.fileType)}</div>
        <div className="doc-header-content">
          <h1>{document.originalFileName}</h1>
          <div className="doc-meta">
            <span className="meta-item">
              <strong>Kích thước:</strong> {document.fileSize} MB
            </span>
            <span className="meta-item">
              <strong>Loại:</strong> {document.fileType}
            </span>
            <span className="meta-item">
              <strong>Tải lên:</strong> {new Date(document.uploadedAt).toLocaleString("vi-VN")}
            </span>
            <span className={`status-badge ${statusBadge.className}`}>
              {statusBadge.text}
            </span>
          </div>
        </div>
      </div>

      {document.status === "Processing" && (
        <div className="processing-notice">
          <div className="processing-spinner">⏳</div>
          <div>
            <h3>Đang xử lý tài liệu</h3>
            <p>Hệ thống đang trích xuất nội dung và tạo tóm tắt. Vui lòng đợi...</p>
          </div>
        </div>
      )}

      {document.status === "Error" && (
        <div className="error-notice">
          <h3>⚠️ Có lỗi xảy ra</h3>
          <p>Không thể xử lý tài liệu này. Vui lòng thử tải lên lại.</p>
        </div>
      )}

      {document.status === "Completed" && (
        <>
          <div className="tabs">
            <button
              className={`tab ${activeTab === "info" ? "active" : ""}`}
              onClick={() => setActiveTab("info")}
            >
              Thông tin
            </button>
            <button
              className={`tab ${activeTab === "summary" ? "active" : ""}`}
              onClick={() => setActiveTab("summary")}
            >
              Tóm tắt
            </button>
            <button
              className={`tab ${activeTab === "text" ? "active" : ""}`}
              onClick={() => setActiveTab("text")}
            >
              Nội dung
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "info" && (
              <div className="info-section">
                <h2>Thông tin tài liệu</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Tên file:</strong>
                    <span>{document.originalFileName}</span>
                  </div>
                  <div className="info-item">
                    <strong>Loại file:</strong>
                    <span>{document.fileType}</span>
                  </div>
                  <div className="info-item">
                    <strong>Kích thước:</strong>
                    <span>{document.fileSize} MB</span>
                  </div>
                  <div className="info-item">
                    <strong>Trạng thái:</strong>
                    <span className={`status-badge ${statusBadge.className}`}>
                      {statusBadge.text}
                    </span>
                  </div>
                  <div className="info-item">
                    <strong>Tải lên lúc:</strong>
                    <span>{new Date(document.uploadedAt).toLocaleString("vi-VN")}</span>
                  </div>
                  {document.summaryUpdatedAt && (
                    <div className="info-item">
                      <strong>Tóm tắt cập nhật:</strong>
                      <span>{new Date(document.summaryUpdatedAt).toLocaleString("vi-VN")}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "summary" && (
              <div className="summary-section">
                {summary?.summaryShort && (
                  <div className="summary-card">
                    <h3>📋 Tóm tắt ngắn</h3>
                    <p className="summary-text">{summary.summaryShort}</p>
                  </div>
                )}
                {summary?.summaryFull && (
                  <div className="summary-card">
                    <h3>📖 Tóm tắt chi tiết</h3>
                    <p className="summary-text">{summary.summaryFull}</p>
                  </div>
                )}
                {!summary?.summaryShort && !summary?.summaryFull && (
                  <div className="empty-content">
                    <p>Chưa có tóm tắt cho tài liệu này</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "text" && (
              <div className="text-section">
                <h3>📄 Nội dung trích xuất</h3>
                {document.extractedText ? (
                  <div className="extracted-text">
                    {document.extractedText}
                  </div>
                ) : (
                  <div className="empty-content">
                    <p>Không có nội dung trích xuất</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default DocumentDetailPage;
