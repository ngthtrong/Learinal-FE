/**
 * Admin Subscription Purchases Page
 * Lists user subscription purchase (userSubscriptions) records with filters & pagination.
 */
import { useEffect, useMemo, useState } from "react";
import { Button, Input } from "@/components/common";
import { adminService } from "@/services/api";

const PAGE_SIZES = [10, 20, 50];

function SubscriptionPurchasesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminService.listUserSubscriptions({
        page,
        pageSize,
        search: debouncedSearch || undefined,
      });
      setItems(data?.items || []);
      setTotal(data?.meta?.total || 0);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Không thể tải danh sách gói người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, debouncedSearch]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const formatCurrency = (v) => {
    if (typeof v !== "number") return "0₫";
    return v.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  };

  const statusMeta = {
    Active: { label: "Hoạt động", className: "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
    Expired: { label: "Hết hạn", className: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400" },
    Cancelled: { label: "Đã hủy", className: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400" },
    PendingPayment: { label: "Chờ thanh toán", className: "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" },
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Quản lý gói</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs sm:text-sm">
              Theo dõi các gói người dùng đang sở hữu hoặc đã hết hạn.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setPage(1);
                fetchData();
              }}
            >
              Làm mới
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-medium p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <Input
                label="Tìm theo tên hoặc tên gói"
                placeholder="Nhập từ khóa..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                inputClassName="py-3"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                Số dòng / trang
              </label>
              <select
                className="w-full px-2 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => {
                setSearch("");
                setPage(1);
                fetchData();
              }}
            >
              Đặt lại
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                setPage(1);
                fetchData();
              }}
            >
              Áp dụng
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-medium overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-600 dark:text-gray-400">Đang tải...</div>
          ) : error ? (
            <div className="py-16 text-center">
              <div className="text-5xl mb-3">⚠️</div>
              <div className="text-error-600 dark:text-error-400 font-medium">{error}</div>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-gray-600 dark:text-gray-400">Chưa có dữ liệu gói</div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="block md:hidden divide-y divide-gray-200 dark:divide-slate-700">
                {items.map((r) => (
                  <div key={r.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {r.userName || "(N/A)"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {r.planName || "—"} • {r.billingCycle === "Monthly" ? "Tháng" : r.billingCycle === "Yearly" ? "Năm" : "—"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {formatCurrency(r.price || 0)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {(() => {
                        const meta = statusMeta[r.status] || {
                          label: r.status || "—",
                          className: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400",
                        };
                        return (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${meta.className}`}>
                            {meta.label}
                          </span>
                        );
                      })()}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {(() => { try { return r.startDate ? new Date(r.startDate).toLocaleDateString("vi-VN") : ""; } catch { return ""; } })()}
                        {r.startDate && r.endDate && " - "}
                        {(() => { try { return r.endDate ? new Date(r.endDate).toLocaleDateString("vi-VN") : ""; } catch { return ""; } })()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Gói
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Chu kỳ
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Giá
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Bắt đầu
                    </th>
                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Kết thúc
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {items.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                          {r.userName || "(N/A)"}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                          {r.planName || "—"}
                        </div>
                        <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatCurrency(r.price || 0)}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                        {r.billingCycle === "Monthly"
                          ? "Tháng"
                          : r.billingCycle === "Yearly"
                          ? "Năm"
                          : "—"}
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                        {formatCurrency(r.price || 0)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        {(() => {
                          const meta = statusMeta[r.status] || {
                            label: r.status || "—",
                            className: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400",
                          };
                          return (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${meta.className}`}
                            >
                              {meta.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {(() => {
                          try {
                            return r.startDate
                              ? new Date(r.startDate).toLocaleDateString("vi-VN")
                              : "—";
                          } catch {
                            return "—";
                          }
                        })()}
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {(() => {
                          try {
                            return r.endDate
                              ? new Date(r.endDate).toLocaleDateString("vi-VN")
                              : "—";
                          } catch {
                            return "—";
                          }
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Hiển thị {items.length} / {total} bản ghi
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="small"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Trước
            </Button>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Trang {page} / {totalPages}
            </div>
            <Button
              variant="secondary"
              size="small"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionPurchasesPage;
