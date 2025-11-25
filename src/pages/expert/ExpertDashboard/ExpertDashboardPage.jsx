/**
 * Expert Dashboard Page
 * Tổng quan dành cho Expert: hoa hồng & yêu cầu kiểm duyệt.
 */
import { useEffect, useState } from "react";
import CoinsIcon from "@/components/icons/CoinsIcon";
import ShieldCheckIcon from "@/components/icons/ShieldCheckIcon";
import DashboardIcon from "@/components/icons/DashboardIcon";
import { commissionRecordsService, validationRequestsService } from "@/services/api";

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển chuyên gia</h1>
            <p className="text-gray-500 mt-1 text-sm">Theo dõi hoa hồng và yêu cầu kiểm duyệt.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setRefreshing(true);
                loadData();
              }}
              className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium shadow hover:bg-primary-700 transition disabled:opacity-50"
              disabled={refreshing}
            >
              {refreshing ? "Đang làm mới..." : "Làm mới"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-error-200 bg-error-50 text-error-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((c) => (
            <div
              key={c.key}
              className="bg-white rounded-xl shadow-medium p-5 border border-gray-100 hover:shadow-large transition group"
            >
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center text-xl text-white mb-4 shadow`}
              >
                {(() => {
                  const Icon = c.icon;
                  return <Icon size={20} stroke={2} className="text-white" />;
                })()}
              </div>
              <div className="text-2xl font-bold text-gray-900 leading-tight">
                {loading ? "—" :
                  c.key.startsWith("earn") || c.key === "avg_validation"
                    ? formatCurrency(c.value || 0)
                    : c.value}
              </div>
              <div className="text-sm text-gray-500 mt-1">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-medium p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Hướng dẫn nhanh</h2>
          <ul className="space-y-3 text-sm text-gray-600 list-disc pl-5">
            <li>Vào mục Hoa hồng để xem chi tiết các bản ghi thu nhập.</li>
            <li>Vào mục Kiểm duyệt để xử lý yêu cầu được gán cho bạn.</li>
            <li>Sau khi hoàn thành kiểm duyệt nhớ gửi quyết định và phản hồi chất lượng.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ExpertDashboardPage;
