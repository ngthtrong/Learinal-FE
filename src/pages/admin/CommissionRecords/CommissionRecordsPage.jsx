/**
 * Commission Records Page
 * Admin: xem mọi bản ghi + đánh dấu trả
 * Expert: xem bản ghi của mình + summary earnings với Hybrid Model breakdown
 */
import { useEffect, useMemo, useState } from "react";
import { Button, Input, Modal, useToast } from "@/components/common";
import { commissionRecordsService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import CoinsIcon from "@/components/icons/CoinsIcon";
import DashboardIcon from "@/components/icons/DashboardIcon";

const PAGE_SIZES = [10, 20, 50];

function CommissionRecordsPage() {
  const toast = useToast();
  const { user } = useAuth();
  const role = user?.role;

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(null); // Expert summary
  const [status, setStatus] = useState(""); // filter: '' | 'Pending' | 'Paid'
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Mark paid modal
  const [markOpen, setMarkOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [paymentRef, setPaymentRef] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await commissionRecordsService.list({
        page,
        pageSize,
        status: status || undefined,
        q: debouncedSearch || undefined,
      });
      setRecords(data?.items || []);
      setTotal(data?.meta?.total || 0);
      // Expert summary endpoint only for Experts
      if (role === "Expert") {
        try {
          const s = await commissionRecordsService.summary();
          setSummary(s);
        } catch (e) {
          console.warn("Summary error", e);
        }
      }
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Không thể tải danh sách hoa hồng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, status, debouncedSearch]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const formatCurrency = (v) => {
    if (typeof v !== "number") return "0₫";
    return v.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  };

  const openMarkPaid = (rec) => {
    setSelectedRecord(rec);
    setPaymentRef("");
    setMarkOpen(true);
  };
  const closeMarkPaid = () => {
    setMarkOpen(false);
    setSelectedRecord(null);
  };

  const confirmMarkPaid = async () => {
    if (!selectedRecord) return;
    setSaving(true);
    try {
      await commissionRecordsService.markPaid(selectedRecord.id, paymentRef || undefined);
      toast.showSuccess("Đánh dấu đã trả thành công");
      closeMarkPaid();
      fetchData();
    } catch (e) {
      console.error(e);
      toast.showError(e?.response?.data?.message || "Thao tác thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Hoa hồng</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              {role === "Admin"
                ? "Quản lý và xác nhận thanh toán hoa hồng cho chuyên gia."
                : "Theo dõi thu nhập từ các lần xác thực."}
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

        {/* Filters + Summary */}
        <div className="mb-6 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-medium p-4 flex flex-col sm:flex-row gap-4 sm:items-end">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Input
                  label={role === "Admin" ? "Tìm theo tên hoặc ExpertId" : "Tìm kiếm"}
                  placeholder={
                    role === "Admin" ? "Nhập tên chuyên gia hoặc ExpertId..." : "Tìm kiếm..."
                  }
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  inputClassName="py-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trạng thái</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Tất cả</option>
                  <option value="Pending">Chờ</option>
                  <option value="Paid">Đã trả</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setStatus("");
                  setSearch("");
                  setPage(1);
                  fetchData();
                }}
              >
                Đặt lại
              </Button>
              <Button
                onClick={() => {
                  setPage(1);
                  fetchData();
                }}
              >
                Áp dụng
              </Button>
            </div>
          </div>
          {role === "Expert" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-medium p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400">Đã nhận</div>
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(summary?.totalEarned || 0)}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-medium p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400">Đang chờ</div>
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(summary?.totalPending || 0)}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-medium p-4">
                <div className="flex items-center gap-1">
                  <CoinsIcon size={14} className="text-blue-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Fixed Rate</span>
                </div>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(summary?.hybridModel?.totalFixed || 0)}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-medium p-4">
                <div className="flex items-center gap-1">
                  <DashboardIcon size={14} className="text-amber-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Revenue Bonus</span>
                </div>
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(summary?.hybridModel?.totalBonus || 0)}
                </div>
              </div>
            </div>
          )}
        </div>
        {role === "Expert" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-medium p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400">Đã nhận</div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(summary?.totalEarned || 0)}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-medium p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400">Đang chờ</div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(summary?.totalPending || 0)}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-medium p-4">
              <div className="flex items-center gap-1">
                <CoinsIcon size={14} className="text-blue-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Fixed Rate</span>
              </div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(summary?.hybridModel?.totalFixed || 0)}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-medium p-4">
              <div className="flex items-center gap-1">
                <DashboardIcon size={14} className="text-amber-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Revenue Bonus</span>
              </div>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(summary?.hybridModel?.totalBonus || 0)}
              </div>
            </div>
          </div>
        )}

        {/* Table container */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-medium overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-600 dark:text-gray-400">Đang tải...</div>
          ) : error ? (
            <div className="py-16 text-center">
              <div className="text-5xl mb-3">⚠️</div>
              <div className="text-error-600 dark:text-error-400 font-medium">{error}</div>
            </div>
          ) : records.length === 0 ? (
            <div className="py-16 text-center text-gray-600 dark:text-gray-400">Không có bản ghi hoa hồng</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Chuyên gia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Loại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fixed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Bonus
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tổng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tạo lúc
                    </th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {r.expertName || r.expertId || "(Không rõ)"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {r.type === "Published" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                            Published
                          </span>
                        ) : r.type === "Validated" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                            Validated
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-blue-600 dark:text-blue-400">
                          {formatCurrency(r.fixedAmount || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-amber-600 dark:text-amber-400">
                          {r.bonusAmount > 0 ? formatCurrency(r.bonusAmount) : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-700 dark:text-gray-300">
                          {formatCurrency(r.commissionAmount || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {r.status === "Paid" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400">
                            Đã trả
                          </span>
                        ) : r.status === "Pending" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400">
                            Chờ
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {r.status || "-"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {(() => {
                          try {
                            return new Date(r.createdAt).toLocaleString("vi-VN");
                          } catch {
                            return "-";
                          }
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex gap-2 justify-end">
                          {role === "Admin" && r.status === "Pending" && (
                            <Button size="small" onClick={() => openMarkPaid(r)}>
                              Đánh dấu trả
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Hiển thị {records.length} / {total} bản ghi
          </div>
          <div className="flex items-center gap-2">
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n}/trang
                </option>
              ))}
            </select>
            <Button
              variant="secondary"
              size="small"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Trước
            </Button>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {page}/{totalPages}
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

        {/* Mark Paid Modal */}
        <Modal
          isOpen={markOpen}
          onClose={closeMarkPaid}
          title="Xác nhận thanh toán"
          confirmText="Xác nhận"
          cancelText="Hủy"
          onConfirm={confirmMarkPaid}
          loading={saving}
        >
          {selectedRecord && (
            <div className="space-y-4">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Đánh dấu bản ghi <span className="font-medium">#{selectedRecord.id}</span> đã được
                thanh toán.
              </div>
              <Input
                label="Mã tham chiếu thanh toán (tùy chọn)"
                placeholder="Ví dụ: TRANS123456"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Sau khi xác nhận trạng thái sẽ chuyển sang "Đã trả".
              </p>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default CommissionRecordsPage;
