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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-error-600 text-lg font-medium">{error}</p>
          <Button onClick={() => navigate("/subjects")}>Quay lại môn học</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start gap-4">
            <Button variant="secondary" onClick={() => navigate("/subjects")}>
              ← Quay lại
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📚 Tài liệu: {subject?.subjectName}
              </h1>
              {subject?.description && <p className="text-gray-600">{subject.description}</p>}
            </div>
          </div>
          <Button onClick={handleUploadDocument}>+ Tải lên tài liệu</Button>
        </div>

        {documents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-medium p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có tài liệu nào</h3>
            <p className="text-gray-600 mb-6">Tải lên tài liệu đầu tiên để bắt đầu học tập</p>
            <Button onClick={handleUploadDocument}>Tải lên tài liệu</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => {
              const statusBadge = getStatusBadge(doc.status);
              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-xl shadow-medium hover:shadow-large transition-shadow p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{getFileIcon(doc.fileType)}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-2 truncate">
                        {doc.originalFileName}
                      </h3>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-gray-600">{doc.fileSize} MB</span>
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
                      <p className="text-sm text-gray-500">
                        {new Date(doc.uploadedAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentListPage;
