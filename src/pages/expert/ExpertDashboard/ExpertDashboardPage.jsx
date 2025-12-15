/**
 * Expert Dashboard Page
 * Tổng quan dành cho Expert: hoa hồng & yêu cầu kiểm duyệt.
 * Supports Hybrid Model: Fixed Rate + Revenue Bonus
 */
import { useEffect, useState } from "react";
import CoinsIcon from "@/components/icons/CoinsIcon";
import ShieldCheckIcon from "@/components/icons/ShieldCheckIcon";
import DashboardIcon from "@/components/icons/DashboardIcon";
import { commissionRecordsService, validationRequestsService } from "@/services/api";
import CommissionInfoCard from "@/components/expert/CommissionInfoCard";

function ExpertDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [pendingValidations, setPendingValidations] = useState(0);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      // Commission summary
      try {
        const s = await commissionRecordsService.summary();
        setSummary(s);
      } catch (e) {
        console.warn("Commission summary error", e);
      }
      // Validation requests (Assigned/InProgress/Pending count for expert)
      try {
        const res = await validationRequestsService.list({ page: 1, pageSize: 1, status: "Pending" });
        const totalPending = res?.meta?.total || 0;
        setPendingValidations(totalPending);
      } catch (e) {
        console.warn("Validation pending error", e);
      }
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCurrency = (v) => {
    if (typeof v !== "number") return "0₫";
    return v.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  };

  // Hybrid Model breakdown
  const hybridBreakdown = summary?.hybridModel || {};
  const totalFixed = hybridBreakdown.totalFixed || 0;
  const totalBonus = hybridBreakdown.totalBonus || 0;

  const cards = [
    {
      key: "earn_total",
      label: "Đã nhận",
      value: summary?.totalEarned || 0,
      icon: CoinsIcon,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      key: "earn_pending",
      label: "Đang chờ",
      value: summary?.totalPending || 0,
      icon: CoinsIcon,
      color: "from-amber-500 to-amber-600",
    },
    {
      key: "validations",
      label: "Yêu cầu chờ",
      value: pendingValidations,
      icon: ShieldCheckIcon,
      color: "from-indigo-500 to-indigo-600",
    },
    {
      key: "avg_validation",
      label: "TB / lượt",
      value: summary?.averagePerValidation || 0,
      icon: DashboardIcon,
      color: "from-purple-500 to-violet-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Bảng điều khiển chuyên gia</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs sm:text-sm">Theo dõi hoa hồng và yêu cầu kiểm duyệt.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setRefreshing(true);
                loadData();
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-primary-600 dark:bg-primary-500 text-white text-sm font-medium shadow hover:bg-primary-700 dark:hover:bg-primary-600 transition disabled:opacity-50"
              disabled={refreshing}
            >
              {refreshing ? "Đang làm mới..." : "Làm mới"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-900/30 text-error-700 dark:text-error-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {cards.map((c) => (
            <div
              key={c.key}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-medium p-4 sm:p-5 border border-gray-100 dark:border-slate-700 hover:shadow-large transition group"
            >
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center text-lg sm:text-xl text-white mb-3 sm:mb-4 shadow`}
              >
                {(() => {
                  const Icon = c.icon;
                  return <Icon size={18} stroke={2} className="text-white sm:w-5 sm:h-5" />;
                })()}
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {loading ? "—" :
                  c.key.startsWith("earn") || c.key === "avg_validation"
                    ? formatCurrency(c.value || 0)
                    : c.value}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Hybrid Model Breakdown */}
        {(totalFixed > 0 || totalBonus > 0) && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-medium p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">Chi tiết thu nhập</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Fixed Rate */}
              <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <CoinsIcon size={14} className="text-white sm:w-4 sm:h-4" />
                  </div>
                  <span className="text-sm sm:text-base font-medium text-blue-700 dark:text-blue-300">Fixed Rate</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(totalFixed)}
                </div>
                <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 mt-1">
                  Thu nhập cố định từ mỗi lần làm quiz
                </p>
                {hybridBreakdown.byType && (
                  <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700 text-sm">
                    <div className="flex justify-between text-blue-700 dark:text-blue-300">
                      <span>Published:</span>
                      <span>{formatCurrency(hybridBreakdown.byType.Published?.fixed || 0)}</span>
                    </div>
                    <div className="flex justify-between text-blue-700 dark:text-blue-300">
                      <span>Validated:</span>
                      <span>{formatCurrency(hybridBreakdown.byType.Validated?.fixed || 0)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Revenue Bonus */}
              <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500 flex items-center justify-center">
                    <DashboardIcon size={14} className="text-white sm:w-4 sm:h-4" />
                  </div>
                  <span className="text-sm sm:text-base font-medium text-amber-700 dark:text-amber-300">Revenue Bonus</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {formatCurrency(totalBonus)}
                </div>
                <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 mt-1">
                  Thưởng khi content đạt &gt;100 lượt/tháng
                </p>
                {hybridBreakdown.byType && (
                  <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-700 text-sm">
                    <div className="flex justify-between text-amber-700 dark:text-amber-300">
                      <span>Published (+5%):</span>
                      <span>{formatCurrency(hybridBreakdown.byType.Published?.bonus || 0)}</span>
                    </div>
                    <div className="flex justify-between text-amber-700 dark:text-amber-300">
                      <span>Validated (+2%):</span>
                      <span>{formatCurrency(hybridBreakdown.byType.Validated?.bonus || 0)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-medium p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">Hướng dẫn nhanh</h2>
          <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 list-disc pl-4 sm:pl-5">
            <li>Vào mục Hoa hồng để xem chi tiết các bản ghi thu nhập.</li>
            <li>Vào mục Kiểm duyệt để xử lý yêu cầu được gán cho bạn.</li>
            <li>Sau khi hoàn thành kiểm duyệt nhớ gửi quyết định và phản hồi chất lượng.</li>
          </ul>
        </div>

        {/* Commission Info Card */}
        <CommissionInfoCard />
      </div>
    </div>
  );
}

export default ExpertDashboardPage;
