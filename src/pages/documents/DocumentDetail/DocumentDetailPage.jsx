import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {Footer} from "@/components/layout";
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
      Uploading: { text: "Đang tải lên", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300" },
      Processing: { text: "Đang xử lý", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300" },
      Completed: { text: "Hoàn thành", color: "bg-success-100 dark:bg-green-900/30 text-success-800 dark:text-green-300" },
      Error: { text: "Lỗi", color: "bg-error-100 dark:bg-red-900/30 text-error-800 dark:text-red-300" },
    };
    const config = statusMap[status] || statusMap.Error;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getFileIcon = (fileType) => {
    const icons = {
      ".pdf": (
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M10 12h4"></path><path d="M10 16h4"></path></svg>
      ),
      ".docx": (
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
      ),
      ".txt": (
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="10" y1="13" x2="14" y2="13"></line><line x1="10" y1="17" x2="14" y2="17"></line></svg>
      ),
    };
    return icons[fileType] || (
      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
    );
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
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="inline-block w-12 h-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-error-100 dark:bg-error-900/30 rounded-3xl flex items-center justify-center mx-auto">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-error-600 dark:text-error-400"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <p className="text-error-600 dark:text-red-400 text-lg font-medium">{error || "Không tìm thấy tài liệu"}</p>
          <Button onClick={() => navigate(-1)}>Quay lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mmin-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:to-gray-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg px-4 sm:px-6 py-4 sm:py-6 mb-4 sm:mb-6">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            ← Quay lại
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-medium border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <div className="shrink-0 hidden sm:block">{getFileIcon(document.fileType)}</div>
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 break-words">{document.originalFileName}</h1>
                {getStatusBadge(document.status)}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Kích thước:</span>{" "}
                  <span className="font-medium text-gray-900 dark:text-gray-100">{document.fileSize} MB</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Loại file:</span>{" "}
                  <span className="font-medium text-gray-900 dark:text-gray-100">{document.fileType}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Ngày tải lên:</span>{" "}
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(document.uploadedAt)}
                  </span>
                </div>
                {document.processedAt && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Ngày xử lý:</span>{" "}
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatDate(document.processedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {document.status === "Processing" && (
          <div className="bg-warning-50 dark:bg-yellow-900/20 border border-warning-200 dark:border-yellow-800 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="inline-block w-5 h-5 border-3 border-warning-600 dark:border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-warning-800 dark:text-yellow-300 font-medium">
                Tài liệu đang được xử lý. Vui lòng quay lại sau.
              </p>
            </div>
          </div>
        )}
        {document.status === "Error" && (
          <div className="bg-error-50 dark:bg-red-900/20 border border-error-200 dark:border-red-800 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-error-600 dark:text-red-400 flex-shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              <div>
                <p className="text-error-800 dark:text-red-300 font-medium">Đã xảy ra lỗi khi xử lý tài liệu</p>
                {document.errorMessage && (
                  <p className="text-error-600 dark:text-red-400 text-sm mt-1">{document.errorMessage}</p>
                )}
              </div>
            </div>
          </div>
        )}
        {document.status === "Completed" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-medium border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              <button
                className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm md:text-base transition-colors inline-flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                  activeTab === "info"
                    ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
                onClick={() => setActiveTab("info")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                Thông tin
              </button>
              <button
                className={`flex-1 px-6 py-4 font-medium text-sm sm:text-base transition-colors inline-flex items-center justify-center gap-2 ${
                  activeTab === "summary"
                    ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
                onClick={() => setActiveTab("summary")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
                Tóm tắt
              </button>
              <button
                className={`flex-1 px-6 py-4 font-medium text-sm sm:text-base transition-colors inline-flex items-center justify-center gap-2 ${
                  activeTab === "text"
                    ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
                onClick={() => setActiveTab("text")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
                Nội dung
              </button>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
              {activeTab === "info" && (
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Thông tin tài liệu</h2>
                    <div className="space-y-3 text-gray-700 dark:text-gray-300">
                      <p>
                        <strong className="text-gray-900 dark:text-gray-100">Tên file gốc:</strong> {document.originalFileName}
                      </p>
                      <p>
                        <strong className="text-gray-900 dark:text-gray-100">Kích thước:</strong> {document.fileSize} MB
                      </p>
                      <p>
                        <strong className="text-gray-900 dark:text-gray-100">Định dạng:</strong> {document.fileType}
                      </p>
                      <p>
                        <strong className="text-gray-900 dark:text-gray-100">Trạng thái:</strong> {getStatusBadge(document.status)}
                      </p>
                      <p>
                        <strong className="text-gray-900 dark:text-gray-100">Ngày tải lên:</strong> {formatDate(document.uploadedAt)}
                      </p>
                      {document.processedAt && (
                        <p>
                          <strong className="text-gray-900 dark:text-gray-100">Ngày xử lý xong:</strong> {formatDate(document.processedAt)}
                        </p>
                      )}
                      {document.extractedText && (
                        <p>
                          <strong className="text-gray-900 dark:text-gray-100">Độ dài nội dung:</strong> {document.extractedText.length} ký tự
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "summary" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Tóm tắt tài liệu</h2>
                    {summary?.summaryFull ? (
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                          {summary.summaryFull}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-4">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-gray-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">Chưa có tóm tắt cho tài liệu này</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {activeTab === "text" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Nội dung trích xuất</h2>
                    {document.extractedText ? (
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                          {document.extractedText}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-4">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-gray-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">Không có nội dung văn bản được trích xuất</p>
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
      <Footer />
    </div>
  );
}

export default DocumentDetailPage;
