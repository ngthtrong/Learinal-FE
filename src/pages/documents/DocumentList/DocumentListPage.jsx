/**
 * Document List Page
 * Display list of uploaded documents for a subject
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import subjectsService from "@/services/api/subjects.service";
import Button from "@/components/common/Button";
function DocumentListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subjectId = searchParams.get("subjectId");

  const [documents, setDocuments] = useState([]);
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    if (subjectId) {
      fetchSubjectAndDocuments();
    } else {
      setError("Vui lòng chọn môn học");
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId]);

  const handleUploadDocument = () => {
    // Navigate to subject detail page where upload is now integrated
    navigate(`/subjects/${subjectId}`);
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
      ".pdf": (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M10 12h4"></path><path d="M10 16h4"></path></svg>
      ),
      ".docx": (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
      ),
      ".txt": (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="10" y1="13" x2="14" y2="13"></line><line x1="10" y1="17" x2="14" y2="17"></line></svg>
      ),
    };
    return icons[fileType] || (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-error-100 dark:bg-error-900/30 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-error-600 dark:text-error-400"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <p className="text-error-600 text-lg font-medium">{error}</p>
          <Button onClick={() => navigate("/subjects")}>Quay lại môn học</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:to-gray-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg px-4 sm:px-6 py-4 sm:py-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <Button variant="secondary" onClick={() => navigate("/subjects")} className="w-full sm:w-auto">
                ← Quay lại
              </Button>
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
                  </div>
                  {subject?.subjectName}
                </h1>
                {subject?.description && (
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">{subject.description}</p>
                )}
              </div>
            </div>
            <Button onClick={handleUploadDocument} className="w-full sm:w-auto">+ Tải lên tài liệu</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Content */}

        {documents.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary-100 dark:bg-primary-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-12 sm:h-12 text-primary-600 dark:text-primary-400"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path><path d="M8 7h6"></path><path d="M8 11h8"></path></svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Chưa có tài liệu nào
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tải lên tài liệu đầu tiên để bắt đầu học tập
            </p>
            <Button onClick={handleUploadDocument}>Tải lên tài liệu</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => {
              const statusBadge = getStatusBadge(doc.status);
              return (
                <div
                  key={doc.id}
                  className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {/* Decorative blurred blob */}
                  <div className="pointer-events-none absolute -top-6 -right-6 w-24 h-24 bg-primary-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity" />

                  {/* Icon - Top */}
                  <div className="mb-4">
                    <div className="text-5xl transform group-hover:scale-110 transition-transform">
                      {getFileIcon(doc.fileType)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {doc.originalFileName}
                    </h3>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs text-gray-600 dark:text-gray-500">
                        {doc.fileSize} MB
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          doc.status === "Completed"
                            ? "bg-success-100 text-success-700"
                            : doc.status === "Processing"
                            ? "bg-warning-100 text-warning-700"
                            : doc.status === "Error"
                            ? "bg-error-100 text-error-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {statusBadge.text}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-500 mb-3">
                      {new Date(doc.uploadedAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => handleViewDocument(doc.id)}
                      disabled={doc.status !== "Completed"}
                      className="w-full"
                    >
                      Chi tiết
                    </Button>
                  </div>

                  {/* Hover underline accent */}
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary-500 group-hover:w-full transition-all" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            © 2025 Learinal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default DocumentListPage;
