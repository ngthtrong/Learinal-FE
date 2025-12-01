import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/common/Button";
import { documentsService, subjectsService } from "@/services/api";
import {Footer} from "@/components/layout";
import DocumentIcon from "@/components/icons/DocumentIcon";

function AllDocumentsPage() {
  const navigate = useNavigate();

  // State
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load all documents from all subjects
  useEffect(() => {
    const loadAllDocuments = async () => {
      try {
        setLoading(true);

        // First, get all subjects
        const fetchAllSubjects = async () => {
          const pageSize = 50;
          let page = 1;
          const all = [];
          for (let i = 0; i < 50; i++) {
            const resp = await subjectsService
              .getSubjects({ page, pageSize, sort: "-updatedAt" })
              .catch(() => ({ items: [], meta: { totalPages: page } }));
            const items = resp?.items || resp?.data?.items || [];
            all.push(...items);
            const totalPages = resp?.meta?.totalPages || 1;
            if (page >= totalPages) break;
            page += 1;
          }
          return all;
        };

        const subjects = await fetchAllSubjects();

        // Then, fetch documents for each subject
        const fetchDocsBySubject = async (subjectId) => {
          const pageSize = 50;
          let page = 1;
          const agg = [];
          for (let i = 0; i < 50; i++) {
            const resp = await documentsService
              .getDocumentsBySubject(subjectId, { page, pageSize })
              .catch(() => ({ data: [], meta: { totalPages: page } }));
            const items = resp?.data || resp?.items || [];
            agg.push(...items);
            const totalPages = resp?.meta?.totalPages || 1;
            if (page >= totalPages) break;
            page += 1;
          }
          return agg;
        };

        const docsArrays = await Promise.all(
          subjects.map((s) => fetchDocsBySubject(s.id || s._id).catch(() => []))
        );
        const allDocs = docsArrays.flat();

        // Deduplicate by id
        const docMap = new Map();
        for (const doc of allDocs) {
          const key = doc?.id || doc?._id;
          if (key && !docMap.has(key)) {
            docMap.set(key, doc);
          }
        }

        setDocuments(Array.from(docMap.values()));
      } catch (err) {
        setError(err.response?.data?.message || "Không thể tải danh sách tài liệu");
      } finally {
        setLoading(false);
      }
    };

    loadAllDocuments();
  }, []);

  // Handle delete document
  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) {
      return;
    }

    try {
      await documentsService.deleteDocument(documentId);
      setDocuments((prev) => prev.filter((doc) => (doc.id || doc._id) !== documentId));
    } catch (err) {
      alert(err.response?.data?.message || "Không thể xóa tài liệu");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Đang tải tài liệu...</p>
            </div>
          </div>
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
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                </div>
                Tài liệu của tôi
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
                Quản lý tất cả tài liệu học tập ({documents.length} tài liệu)
              </p>
            </div>
            <Button onClick={() => navigate("/subjects")} className="w-full sm:w-auto">Chọn môn học để upload</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Documents Grid */}
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-3xl flex items-center justify-center mb-6">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600 dark:text-primary-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Chưa có tài liệu nào</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
              Upload tài liệu đầu tiên để bắt đầu học tập. Chọn môn học để upload tài liệu.
            </p>
            <Button onClick={() => navigate("/subjects")}>Đến trang môn học</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => {
              const docId = doc.id || doc._id;
              const fileName = doc.originalFileName || doc.fileName || doc.filename || "Tài liệu";
              const status = doc.status || "Unknown";
              const createdAt = doc.createdAt;
              const subjectName = doc.subject?.name || doc.subject?.subjectName || "";

              const statusColors = {
                Uploading: "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30",
                Processing:
                  "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30",
                Completed: "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30",
                Error: "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30",
              };

              const statusText = {
                Uploading: "Đang tải lên",
                Processing: "Đang xử lý",
                Completed: "Hoàn tất",
                Error: "Lỗi",
              };

              const statusIcons = {
                Uploading: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>,
                Processing: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6M4.2 4.2l4.2 4.2m5.6 5.6 4.2 4.2M1 12h6m6 0h6M4.2 19.8l4.2-4.2m5.6-5.6 4.2-4.2"></path></svg>,
                Completed: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline"><polyline points="20 6 9 17 4 12"></polyline></svg>,
                Error: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>,
              };

              return (
                <div
                  key={docId}
                  className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
                  onClick={() => navigate(`/documents/${docId}`)}
                >
                  {/* Decorative blob */}
                  <div className="pointer-events-none absolute -top-6 -right-6 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity" />

                  {/* Icon - Top */}
                  <div className="mb-4">
                    <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-primary-500/20 text-primary-600 dark:text-primary-400 shadow-inner group-hover:scale-110 transition-transform">
                      <DocumentIcon size={28} />
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    className="text-xl font-semibold text-gray-900 dark:text-gray-100 leading-tight mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
                    title={fileName}
                  >
                    {fileName}
                  </h3>
                  {createdAt && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      {formatDate(createdAt)}
                    </p>
                  )}

                  {/* Subject info */}
                  {subjectName && (
                    <div className="text-sm text-gray-700 dark:text-gray-400 mb-3 flex items-center gap-1.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
                      <span className="font-medium">Môn học:</span> {subjectName}
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="flex-grow flex flex-wrap gap-2 items-start mb-4">
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full border inline-flex items-center gap-1 ${
                        statusColors[status] || statusColors.Completed
                      }`}
                    >
                      {statusIcons[status]}
                      {statusText[status] || status}
                    </span>
                  </div>

                  {/* Action Buttons - Always at bottom */}
                  <div className="mt-auto flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/documents/${docId}`);
                      }}
                      className="flex-1 px-3 py-2 text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 transition-all shadow-sm inline-flex items-center justify-center gap-1.5"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      Xem chi tiết
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDocument(docId);
                      }}
                      className="w-10 h-10 flex items-center justify-center shrink-0 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-500/30 border border-red-300 dark:border-red-500/30 hover:border-red-500 dark:hover:border-red-500 transition-all shadow-sm"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
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
      <Footer />
    </div>
  );
}

export default AllDocumentsPage;
