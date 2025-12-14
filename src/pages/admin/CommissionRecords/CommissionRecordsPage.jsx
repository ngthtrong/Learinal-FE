/**
 * Commission Records Page
 * Admin: xem mọi bản ghi + đánh dấu trả
 * Expert: xem bản ghi của mình + summary earnings với Hybrid Model breakdown
 */
import { useEffect, useMemo, useState } from "react";
import { Button, Input, Modal, useToast } from "@/components/common";
import { commissionRecordsService, paymentBatchesService } from "@/services/api";
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
  
  // Payment info modal
  const [paymentInfoOpen, setPaymentInfoOpen] = useState(false);
  
  // Expert details modal (for Admin)
  const [expertDetailsOpen, setExpertDetailsOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [expertRecords, setExpertRecords] = useState([]);
  const [loadingExpertDetails, setLoadingExpertDetails] = useState(false);
  
  // Payment batch modal (for Admin)
  const [paymentBatchOpen, setPaymentBatchOpen] = useState(false);
  const [paymentBatch, setPaymentBatch] = useState(null);
  const [creatingBatch, setCreatingBatch] = useState(false);
  const [completingBatch, setCompletingBatch] = useState(false);
  
  // Admin: full expert summaries (calculated from ALL records, not just current page)
  const [expertSummariesData, setExpertSummariesData] = useState([]);

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
      // Admin: fetch summaries for ALL unique experts (not just current page)
      if (role === "Admin") {
        try {
          // Fetch all records to get all unique experts
          const allData = await commissionRecordsService.list({
            page: 1,
            pageSize: 10000,
            status: status || undefined,
            q: debouncedSearch || undefined,
          });
          
          const allRecords = allData?.items || [];
          if (allRecords.length > 0) {
            const uniqueExperts = [...new Set(allRecords.map(r => r.expertId))];
            const summaries = await Promise.all(
              uniqueExperts.map(async (expertId) => {
                try {
                  const s = await commissionRecordsService.summary(null, expertId);
                  const expertName = allRecords.find(r => r.expertId === expertId)?.expertName || "(Không rõ)";
                  return {
                    expertId,
                    expertName,
                    totalEarned: s.totalEarned || 0,
                    totalPending: s.totalPending || 0,
                    recordCount: s.totalValidations || 0,
                  };
                } catch (e) {
                  console.warn(`Summary error for expert ${expertId}`, e);
                  return null;
                }
              })
            );
            
            const validSummaries = summaries.filter(s => s !== null).sort((a, b) => 
              (b.totalEarned + b.totalPending) - (a.totalEarned + a.totalPending)
            );
            setExpertSummariesData(validSummaries);
          }
        } catch (e) {
          console.warn("Expert summaries error", e);
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

  // Use pre-calculated expert summaries for Admin view
  const expertSummaries = expertSummariesData;

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
      // Refresh expert details if modal is open
      if (expertDetailsOpen && selectedExpert) {
        fetchExpertDetails(selectedExpert.expertId);
      }
    } catch (e) {
      console.error(e);
      toast.showError(e?.response?.data?.message || "Thao tác thất bại");
    } finally {
      setSaving(false);
    }
  };
  
  const fetchExpertDetails = async (expertId) => {
    setLoadingExpertDetails(true);
    try {
      // Fetch summary using the same endpoint as expert
      const summary = await commissionRecordsService.summary(null, expertId);
      
      // Fetch ALL records for this expert (use very high pageSize to get all)
      const data = await commissionRecordsService.list({
        page: 1,
        pageSize: 10000, // Ensure we get ALL records
        q: expertId,
      });
      setExpertRecords(data?.items || []);
      
      // Update selected expert with correct totals from summary
      setSelectedExpert(prev => ({
        ...prev,
        totalEarned: summary.totalEarned || 0,
        totalPending: summary.totalPending || 0,
      }));
    } catch (e) {
      console.error(e);
      toast.showError("Không thể tải chi tiết");
    } finally {
      setLoadingExpertDetails(false);
    }
  };
  
  const openExpertDetails = (expert) => {
    setSelectedExpert(expert);
    setExpertDetailsOpen(true);
    fetchExpertDetails(expert.expertId);
  };
  
  const closeExpertDetails = () => {
    setExpertDetailsOpen(false);
    setSelectedExpert(null);
    setExpertRecords([]);
  };
  
  const createPaymentBatch = async (expert) => {
    if (expert.totalPending < 2000) {
      toast.showError("Tổng số tiền phải từ 2,000đ trở lên");
      return;
    }
    
    try {
      setCreatingBatch(true);
      const batch = await paymentBatchesService.createBatch(expert.expertId);
      setPaymentBatch(batch);
      setPaymentBatchOpen(true);
      toast.showSuccess("Tạo đợt thanh toán thành công");
    } catch (e) {
      console.error(e);
      toast.showError(e?.response?.data?.message || "Không thể tạo đợt thanh toán");
    } finally {
      setCreatingBatch(false);
    }
  };
  
  const completePaymentBatch = async () => {
    if (!paymentBatch) return;
    
    try {
      setCompletingBatch(true);
      await paymentBatchesService.completeBatch(paymentBatch._id || paymentBatch.id);
      toast.showSuccess("Xác nhận thanh toán thành công");
      setPaymentBatchOpen(false);
      setPaymentBatch(null);
      fetchData();
      if (expertDetailsOpen && selectedExpert) {
        fetchExpertDetails(selectedExpert.expertId);
      }
    } catch (e) {
      console.error(e);
      toast.showError(e?.response?.data?.message || "Không thể xác nhận thanh toán");
    } finally {
      setCompletingBatch(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Hoa hồng</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs sm:text-sm">
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-medium p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-2">
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
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">Trạng thái</label>
                <select
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
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
          {role === "Expert" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-medium p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400">Đã nhận</div>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(summary?.totalEarned || 0)}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-medium p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Đang chờ</div>
                  <button
                    onClick={() => setPaymentInfoOpen(true)}
                    className="text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 transition"
                    title="Thông tin thanh toán"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(summary?.totalPending || 0)}
                </div>
              </div>
            </div>
          )}
        </div>

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
            <>
              {role === "Admin" ? (
                /* Admin View: Expert Summary List */
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {expertSummaries.map((expert) => (
                    <div
                      key={expert.expertId}
                      className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => openExpertDetails(expert)}
                        >
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {expert.expertName}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {expert.recordCount} giao dịch
                          </p>
                        </div>
                        <div className="flex items-center gap-4 sm:gap-6">
                          <div className="text-right">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Đã nhận</div>
                            <div className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(expert.totalEarned)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Đang chờ</div>
                            <div className="text-base sm:text-lg font-bold text-amber-600 dark:text-amber-400">
                              {formatCurrency(expert.totalPending)}
                            </div>
                          </div>
                          {expert.totalPending >= 2000 && (
                            <Button
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                createPaymentBatch(expert);
                              }}
                              disabled={creatingBatch}
                            >
                              Thanh toán
                            </Button>
                          )}
                          <div 
                            className="cursor-pointer"
                            onClick={() => openExpertDetails(expert)}
                          >
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Expert View: Original Table */
                <>
              {/* Mobile Cards View */}
              <div className="block md:hidden divide-y divide-gray-200 dark:divide-gray-700">
                {records.map((r) => (
                  <div key={r.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {r.expertName || r.expertId || "(Không rõ)"}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          📚 {r.metadata?.questionSetTitle || "(Không rõ)"}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {r.type === "Published" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                              Published
                            </span>
                          ) : r.type === "Validated" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                              Validated
                            </span>
                          ) : null}
                          {r.status === "Paid" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400">
                              Đã trả
                            </span>
                          ) : r.status === "Pending" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400">
                              Chờ
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(r.commissionAmount || 0)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {(() => { try { return new Date(r.createdAt).toLocaleDateString("vi-VN"); } catch { return "-"; } })()}
                        </div>
                      </div>
                    </div>
                    {role === "Admin" && r.status === "Pending" && (
                      <Button size="small" onClick={() => openMarkPaid(r)} className="w-full mt-2">
                        Đánh dấu đã trả
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Chuyên gia
                    </th>
                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Bộ đề
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Loại
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tổng
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tạo lúc
                    </th>
                    <th className="px-3 sm:px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                          {r.expertName || r.expertId || "(Không rõ)"}
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4">
                        <div className="text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate" title={r.metadata?.questionSetTitle || "(Không rõ)"}>
                          {r.metadata?.questionSetTitle || "(Không rõ)"}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
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
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                          {formatCurrency(r.commissionAmount || 0)}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
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
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {(() => {
                          try {
                            return new Date(r.createdAt).toLocaleString("vi-VN");
                          } catch {
                            return "-";
                          }
                        })()}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex gap-1 sm:gap-2 justify-end">
                          {role === "Admin" && r.status === "Pending" && (
                            <Button size="small" onClick={() => openMarkPaid(r)}>
                              <span className="hidden sm:inline">Đánh dấu trả</span>
                              <span className="sm:hidden">✓</span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Hiển thị {records.length} / {total} bản ghi
          </div>
          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-end">
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

        {/* Payment Info Modal */}
        <Modal
          isOpen={paymentInfoOpen}
          onClose={() => setPaymentInfoOpen(false)}
          title="📅 Lịch thanh toán hoa hồng"
          confirmText="Đã hiểu"
          onConfirm={() => setPaymentInfoOpen(false)}
          hideCancel
        >
          <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-2">
                    Chu kỳ thanh toán
                  </h3>
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    Hoa hồng sẽ được Admin thanh toán vào <strong>đầu mỗi tháng</strong> (ngày 1-5).
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">1</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Tích lũy hoa hồng</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Mọi giao dịch trong tháng sẽ có trạng thái <span className="px-2 py-0.5 rounded-full bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400 text-xs font-medium">Đang chờ</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-green-600 dark:text-green-400">2</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Xử lý thanh toán</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Admin sẽ xử lý thanh toán vào đầu tháng sau (1-5 hàng tháng)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">3</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Nhận tiền</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Sau khi thanh toán, trạng thái chuyển sang <span className="px-2 py-0.5 rounded-full bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 text-xs font-medium">Đã trả</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                💡 <strong>Lưu ý:</strong> Nếu có thắc mắc về thanh toán, vui lòng liên hệ Admin để được hỗ trợ.
              </p>
            </div>
          </div>
        </Modal>

        {/* Expert Details Modal (Admin only) */}
        <Modal
          isOpen={expertDetailsOpen}
          onClose={closeExpertDetails}
          title={`Chi tiết hoa hồng - ${selectedExpert?.expertName || ""}`}
          size="large"
          hideConfirm
          hideCancel
        >
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
              <div className="text-xs text-emerald-600 dark:text-emerald-400">Đã nhận</div>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {formatCurrency(selectedExpert?.totalEarned || 0)}
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="text-xs text-amber-600 dark:text-amber-400">Đang chờ</div>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {formatCurrency(selectedExpert?.totalPending || 0)}
              </div>
            </div>
          </div>

          {/* Payment Warning/Button */}
          {selectedExpert?.totalPending > 0 && selectedExpert?.totalPending < 2000 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-400 mb-4">
              ⚠️ Cần tối thiểu 2,000đ để thanh toán (hiện tại: {formatCurrency(selectedExpert.totalPending)})
            </div>
          )}
          {selectedExpert?.totalPending >= 2000 && (
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => {
                  closeExpertDetails();
                  createPaymentBatch(selectedExpert);
                }}
                disabled={creatingBatch}
              >
                {creatingBatch ? "Đang tạo..." : `Thanh toán ${formatCurrency(selectedExpert.totalPending)}`}
              </Button>
            </div>
          )}

          {/* Records List */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Danh sách giao dịch ({expertRecords.length})
            </h3>
            
            {loadingExpertDetails ? (
              <div className="py-8 text-center text-gray-500">Đang tải...</div>
            ) : expertRecords.length === 0 ? (
              <div className="py-8 text-center text-gray-500">Không có dữ liệu</div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2">
                    {expertRecords.map((r) => (
                      <div key={r.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            📚 {r.metadata?.questionSetTitle || "(Không rõ)"}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {r.type === "Published" ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                Published
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                                Validated
                              </span>
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-base font-bold text-gray-900 dark:text-gray-100">
                            {formatCurrency(r.commissionAmount || 0)}
                          </div>
                          {r.status === "Paid" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400">
                              Đã trả
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400">
                              Chờ
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Modal>

        {/* Payment Batch QR Code Modal (Admin only) */}
        <Modal
          isOpen={paymentBatchOpen}
          onClose={() => setPaymentBatchOpen(false)}
          title="Thanh toán hoa hồng"
          size="large"
          hideConfirm
          hideCancel
        >
          {paymentBatch && (
            <div className="space-y-6">
              {/* Bank Account Info */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Thông tin tài khoản nhận
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Chủ tài khoản:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {paymentBatch.bankAccount?.accountHolderName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Số tài khoản:</span>
                    <span className="font-mono font-medium text-gray-900 dark:text-white">
                      {paymentBatch.bankAccount?.accountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Ngân hàng:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {paymentBatch.bankAccount?.bankName}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Số tiền:</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(paymentBatch.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              {paymentBatch.qrCode && (
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <img
                      src={paymentBatch.qrCode}
                      alt="QR Code thanh toán"
                      className="w-64 h-64"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center">
                    Quét mã QR để chuyển khoản
                  </p>
                </div>
              )}

              {/* Commission Details */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  📌 Lưu ý
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Tổng số {paymentBatch.commissionIds?.length || 0} giao dịch</li>
                  <li>• Kiểm tra kỹ thông tin tài khoản trước khi chuyển</li>
                  <li>• Sau khi chuyển tiền, nhấn "Xác nhận đã thanh toán"</li>
                  <li>• Hệ thống sẽ tự động cập nhật trạng thái hoa hồng</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="secondary"
                  onClick={() => setPaymentBatchOpen(false)}
                  disabled={completingBatch}
                >
                  Hủy
                </Button>
                <Button
                  onClick={completePaymentBatch}
                  disabled={completingBatch}
                >
                  {completingBatch ? "Đang xử lý..." : "Xác nhận đã thanh toán"}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default CommissionRecordsPage;
