import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { contentFlagsService } from "@/services/api";
import Button from "@/components/common/Button";
import { useToast } from "@/components/common";
import { getErrorMessage } from "@/utils/errorHandler";
import { formatDate } from "@/utils/formatters";

const MyReportsPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchFlags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const fetchFlags = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        myReports: true,
      };
      
      if (statusFilter !== "All") {
        params.status = statusFilter;
      }

      const data = await contentFlagsService.listFlags(params);
      setFlags(data.flags || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      const message = getErrorMessage(err);
      toast.showError(message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      Pending: {
        label: "Đang chờ xử lý",
        badge: "bg-yellow-100 text-yellow-700",
        description: "Admin đang xem xét báo cáo của bạn",
      },
      SentToExpert: {
        label: "Đã gửi cho Expert",
        badge: "bg-purple-100 text-purple-700",
        description: "Admin đã chuyển báo cáo cho Expert xử lý",
      },
      ExpertResponded: {
        label: "Expert đã phản hồi",
        badge: "bg-indigo-100 text-indigo-700",
        description: "Expert đã gửi phản hồi, Admin đang xem xét",
      },
      Resolved: {
        label: "Đã giải quyết",
        badge: "bg-green-100 text-green-700",
        description: "Vấn đề đã được xử lý hoàn tất",
      },
      Dismissed: {
        label: "Đã từ chối",
        badge: "bg-gray-100 text-gray-700",
        description: "Admin đã xem xét và từ chối báo cáo",
      },
    };
    return statusMap[status] || statusMap.Pending;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Báo cáo của tôi
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Theo dõi trạng thái các báo cáo nội dung bạn đã gửi
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-blue-900 dark:text-blue-300">
              <p className="font-medium mb-1">Quy trình xử lý báo cáo:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Admin xem xét báo cáo của bạn</li>
                <li>Nếu hợp lệ, Admin sẽ gửi cho Expert xử lý</li>
                <li>Expert sửa chữa vấn đề và gửi phản hồi</li>
                <li>Admin xác nhận và đánh dấu là đã giải quyết</li>
              </ol>
              <p className="mt-2">Bạn sẽ nhận được thông báo tại mỗi bước.</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Trạng thái:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="All">Tất cả</option>
              <option value="Pending">Đang chờ xử lý</option>
              <option value="SentToExpert">Đã gửi cho Expert</option>
              <option value="ExpertResponded">Expert đã phản hồi</option>
              <option value="Resolved">Đã giải quyết</option>
              <option value="Dismissed">Đã từ chối</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : flags.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              Chưa có báo cáo nào
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Bạn chưa gửi báo cáo nội dung nào.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {flags.map((flag) => {
              const statusInfo = getStatusInfo(flag.status);
              return (
                <div
                  key={flag.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          Báo cáo #{flag.id.slice(-8)}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.badge}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {statusInfo.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Ngày gửi: {formatDate(flag.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Lý do: {flag.reason}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {flag.description}
                    </p>
                  </div>

                  {flag.adminNote && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 mb-3">
                      <p className="text-xs font-medium text-amber-900 dark:text-amber-300 mb-1">
                        Ghi chú từ Admin:
                      </p>
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        {flag.adminNote}
                      </p>
                    </div>
                  )}

                  {flag.expertResponse && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
                      <p className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-1">
                        Phản hồi từ Expert:
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {flag.expertResponse}
                      </p>
                    </div>
                  )}

                  {flag.resolutionNote && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-3">
                      <p className="text-xs font-medium text-green-900 dark:text-green-300 mb-1">
                        Kết luận:
                      </p>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        {flag.resolutionNote}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/question-sets/${flag.contentId}`)}
                    >
                      Xem bộ đề
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Trang trước
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Trang {page} / {totalPages}
            </span>
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Trang sau
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReportsPage;
