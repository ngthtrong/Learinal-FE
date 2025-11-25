import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import documentsService from "@/services/api/documents.service";
import Button from "@/components/common/Button";

function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("info");

  const fetchDocument = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const docData = await documentsService.getDocumentById(id);
      setDocument(docData);

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
  }, [id]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  const getStatusBadge = (status) => {
    const statusMap = {
      Uploading: { text: "Đang tải lên", color: "bg-blue-100 text-blue-800" },
      Processing: { text: "Đang xử lý", color: "bg-yellow-100 text-yellow-800" },
      Completed: { text: "Hoàn thành", color: "bg-success-100 text-success-800" },
      Error: { text: "Lỗi", color: "bg-error-100 text-error-800" },
    };
    const config = statusMap[status] || statusMap.Error;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getFileIcon = (fileType) => {
    const icons = { ".pdf": "📄", ".docx": "📝", ".txt": "📃" };
    return icons[fileType] || "📎";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="inline-block w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">⚠️</div>
          <p className="text-error-600 text-lg font-medium">{error || "Không tìm thấy tài liệu"}</p>
          <Button onClick={() => navigate(-1)}>Quay lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg px-6 py-6 mb-6">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            ← Quay lại
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-xl shadow-medium p-8 mb-6">
          <div className="flex items-start gap-6">
            <div className="text-6xl shrink-0">{getFileIcon(document.fileType)}</div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{document.originalFileName}</h1>
                {getStatusBadge(document.status)}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Kích thước:</span>{" "}
                  <span className="font-medium text-gray-900">{document.fileSize} MB</span>
                </div>
                <div>
                  <span className="text-gray-600">Loại file:</span>{" "}
                  <span className="font-medium text-gray-900">{document.fileType}</span>
                </div>
                <div>
                  <span className="text-gray-600">Ngày tải lên:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {formatDate(document.uploadedAt)}
                  </span>
                </div>
                {document.processedAt && (
                  <div>
                    <span className="text-gray-600">Ngày xử lý:</span>{" "}
                    <span className="font-medium text-gray-900">
                      {formatDate(document.processedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {document.status === "Processing" && (
          <div className="bg-warning-50 border border-warning-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="inline-block w-5 h-5 border-3 border-warning-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-warning-800 font-medium">
                Tài liệu đang được xử lý. Vui lòng quay lại sau.
              </p>
            </div>
          </div>
        )}
        {document.status === "Error" && (
          <div className="bg-error-50 border border-error-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <p className="text-error-800 font-medium">Đã xảy ra lỗi khi xử lý tài liệu</p>
                {document.errorMessage && (
                  <p className="text-error-600 text-sm mt-1">{document.errorMessage}</p>
                )}
              </div>
            </div>
          </div>
        )}
        {document.status === "Completed" && (
          <div className="bg-white rounded-xl shadow-medium overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 px-6 py-4 font-medium text-sm sm:text-base transition-colors ${
                  activeTab === "info"
                    ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("info")}
              >
                📋 Thông tin
              </button>
              <button
                className={`flex-1 px-6 py-4 font-medium text-sm sm:text-base transition-colors ${
                  activeTab === "summary"
                    ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("summary")}
              >
                📝 Tóm tắt
              </button>
              <button
                className={`flex-1 px-6 py-4 font-medium text-sm sm:text-base transition-colors ${
                  activeTab === "text"
                    ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("text")}
              >
                📄 Nội dung
              </button>
            </div>
            <div className="p-8">
              {activeTab === "info" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Thông tin tài liệu</h2>
                    <div className="space-y-3 text-gray-700">
                      <p>
                        <strong>Tên file gốc:</strong> {document.originalFileName}
                      </p>
                      <p>
                        <strong>Kích thước:</strong> {document.fileSize} MB
                      </p>
                      <p>
                        <strong>Định dạng:</strong> {document.fileType}
                      </p>
                      <p>
                        <strong>Trạng thái:</strong> {getStatusBadge(document.status)}
                      </p>
                      <p>
                        <strong>Ngày tải lên:</strong> {formatDate(document.uploadedAt)}
                      </p>
                      {document.processedAt && (
                        <p>
                          <strong>Ngày xử lý xong:</strong> {formatDate(document.processedAt)}
                        </p>
                      )}
                      {document.extractedText && (
                        <p>
                          <strong>Độ dài nội dung:</strong> {document.extractedText.length} ký tự
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "summary" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Tóm tắt tài liệu</h2>
                    {summary?.summaryFull ? (
                      <div className="prose max-w-none">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {summary.summaryFull}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📝</div>
                        <p className="text-gray-500">Chưa có tóm tắt cho tài liệu này</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {activeTab === "text" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Nội dung trích xuất</h2>
                    {document.extractedText ? (
                      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                          {document.extractedText}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📄</div>
                        <p className="text-gray-500">Không có nội dung văn bản được trích xuất</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 text-sm">© 2025 Learinal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default DocumentDetailPage;
