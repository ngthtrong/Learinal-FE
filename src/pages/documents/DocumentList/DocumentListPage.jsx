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
      ".pdf": "📄",
      ".docx": "📝",
      ".txt": "📃",
    };
    return icons[fileType] || "📎";
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
          <div className="text-6xl mb-4">⚠️</div>
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
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg px-6 py-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="secondary" onClick={() => navigate("/subjects")}>
                ← Quay lại
              </Button>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                  📚 {subject?.subjectName}
                </h1>
                {subject?.description && (
                  <p className="text-lg text-gray-600 dark:text-gray-400">{subject.description}</p>
                )}
              </div>
            </div>
            <Button onClick={handleUploadDocument}>+ Tải lên tài liệu</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Content */}

        {documents.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
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
