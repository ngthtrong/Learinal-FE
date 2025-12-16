import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { contentFlagsService } from "@/services/api";
import Button from "@/components/common/Button";
import { useToast } from "@/components/common";
import { getErrorMessage } from "@/utils/errorHandler";
import { formatDate } from "@/utils/formatters";

const AdminContentFlagsPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchFlags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const fetchFlags = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        pageSize: 20,
      };
      
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await contentFlagsService.listFlags(params);
      setFlags(response.items || []);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (id) => {
    navigate(`/admin/content-flags/${id}`);
  };

  const getStatusBadge = (status) => {
    const badges = {
      Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      UnderReview: "bg-blue-100 text-blue-700 border-blue-200",
      SentToExpert: "bg-purple-100 text-purple-700 border-purple-200",
      ExpertResponded: "bg-indigo-100 text-indigo-700 border-indigo-200",
      Resolved: "bg-green-100 text-green-700 border-green-200",
      Dismissed: "bg-gray-100 text-gray-700 border-gray-200",
    };
    
    const labels = {
      Pending: "Chờ xử lý",
      UnderReview: "Đang xem xét",
      SentToExpert: "Đã gửi Expert",
      ExpertResponded: "Expert đã trả lời",
      Resolved: "Đã giải quyết",
      Dismissed: "Đã từ chối",
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${badges[status] || badges.Pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getReasonLabel = (reason) => {
    const labels = {
      Inaccurate: "Sai lệch",
      Inappropriate: "Không phù hợp",
      Spam: "Spam",
      Offensive: "Xúc phạm",
      Copyright: "Bản quyền",
      Other: "Khác",
    };
    return labels[reason] || reason;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Quản lý Báo cáo Nội dung
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Xem xét và xử lý các báo cáo từ người dùng
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Trạng thái:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">Tất cả</option>
              <option value="Pending">Chờ xử lý</option>
              <option value="SentToExpert">Đã gửi Expert</option>
              <option value="ExpertResponded">Expert đã trả lời</option>
              <option value="Resolved">Đã giải quyết</option>
              <option value="Dismissed">Đã từ chối</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Đang tải...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && flags.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Không có báo cáo nào</p>
          </div>
        )}

        {/* Flags List */}
        {!loading && flags.length > 0 && (
          <div className="space-y-4">
            {flags.map((flag) => (
              <div
                key={flag.id}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewDetail(flag.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusBadge(flag.status)}
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {getReasonLabel(flag.reason)}
                      </span>
                    </div>
                    
                    <p className="text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                      {flag.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>
                        Người báo cáo: <strong>{flag.reportedBy?.fullName || "N/A"}</strong>
                      </span>
                      <span>•</span>
                      <span>{formatDate(flag.createdAt)}</span>
                      {flag.assignedExpert && (
                        <>
                          <span>•</span>
                          <span>
                            Expert: <strong>{flag.assignedExpert.fullName}</strong>
                          </span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button 
                        variant="secondary" 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/question-sets/${flag.contentId}`);
                        }}
                      >
                        <span className="flex items-center gap-1">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                          </svg>
                          Xem bộ đề
                        </span>
                      </Button>
                    </div>
                  </div>
                  
                  <Button variant="secondary" size="small">
                    Xem chi tiết →
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="secondary"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              ← Trang trước
            </Button>
            <span className="text-gray-700 dark:text-gray-300">
              Trang {page} / {totalPages}
            </span>
            <Button
              variant="secondary"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Trang sau →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContentFlagsPage;
