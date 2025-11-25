/**
 * Admin Dashboard Page
 * Overview of admin statistics and quick actions
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UsersIcon from "@/components/icons/UsersIcon";
import ShieldCheckIcon from "@/components/icons/ShieldCheckIcon";
import CoinsIcon from "@/components/icons/CoinsIcon";
import DashboardIcon from "@/components/icons/DashboardIcon";
import SubscriptionsIcon from "@/components/icons/SubscriptionsIcon";
import ManagePackagesIcon from "@/components/icons/ManagePackagesIcon";
import { adminService, commissionRecordsService } from "@/services/api";
import subscriptionsService from "@/services/api/subscriptions.service";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [plansSummary, setPlansSummary] = useState({ active: 0, inactive: 0, total: 0 });
  const [userSubsTotal, setUserSubsTotal] = useState(0);
  const [unpaidCommissionTotal, setUnpaidCommissionTotal] = useState(0);
  const [unpaidCommissionCount, setUnpaidCommissionCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const data = await adminService.getStats();
      setStats(data);
      // Fetch all plans (admin endpoint) for summary
      try {
        const resAll = await subscriptionsService.getAllPlans({});
        const plans = resAll?.data?.plans || [];
        const active = plans.filter((p) => p.status === "Active").length;
        const inactive = plans.filter((p) => p.status === "Inactive").length;
        setPlansSummary({ active, inactive, total: plans.length });
      } catch (e) {
        console.warn("Plans summary error", e);
      }
      // Fetch total user subscriptions count (first page meta)
      try {
        const subsRes = await adminService.listUserSubscriptions({ page: 1, pageSize: 1 });
        setUserSubsTotal(subsRes?.meta?.total || 0);
      } catch (e) {
        console.warn("User subscriptions summary error", e);
      }
      // Fetch unpaid commissions (Pending) to compute sum and count (approx, first 500)
      try {
        const unpaidRes = await commissionRecordsService.list({
          page: 1,
          pageSize: 500,
          status: "Pending",
        });
        const items = unpaidRes?.items || [];
        const sum = items.reduce(
          (acc, it) => acc + (typeof it.commissionAmount === "number" ? it.commissionAmount : 0),
          0
        );
        setUnpaidCommissionTotal(sum);
        setUnpaidCommissionCount(unpaidRes?.meta?.total || items.length);
      } catch (e) {
        console.warn("Unpaid commission summary error", e);
      }
      // Recent activities: user subscription purchases & commission payments
      try {
        setActivitiesLoading(true);
        const [subsRes, paidRes] = await Promise.all([
          adminService.listUserSubscriptions({ page: 1, pageSize: 10 }),
          commissionRecordsService.list({ page: 1, pageSize: 10, status: "Paid" }),
        ]);
        const subsActs = (subsRes?.items || []).map((s) => {
          const date = s.startDate || s.createdAt || s.endDate;
          return {
            type: "subscription_purchase",
            id: s.id,
            dateMs: date ? new Date(date).getTime() : 0,
            dateIso: date || null,
            label: `${s.userName || "Người dùng"} mua gói ${s.planName || "—"}`,
            status: s.status,
          };
        });
        const paidActs = (paidRes?.items || []).map((c) => {
          const date = c.paidAt || c.transactionDate || c.createdAt;
          return {
            type: "commission_paid",
            id: c.id,
            dateMs: date ? new Date(date).getTime() : 0,
            dateIso: date || null,
            label: `Trả hoa hồng cho ${c.expertName || "chuyên gia"} (${(
              c.commissionAmount || 0
            ).toLocaleString("vi-VN", { style: "currency", currency: "VND" })})`,
          };
        });
        const merged = [...subsActs, ...paidActs].sort((a, b) => b.dateMs - a.dateMs).slice(0, 15);
        setActivities(merged);
      } catch (e) {
        console.warn("Activities load error", e);
      } finally {
        setActivitiesLoading(false);
      }
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Không thể tải thống kê");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = [
    {
      key: "users",
      label: "Người dùng",
      value: stats?.users?.total ?? 0,
      icon: UsersIcon,
      color: "from-indigo-500 to-indigo-600",
      footer: stats ? `Hoạt động: ${stats.users?.active ?? 0}` : undefined,
    },
    {
      key: "plans",
      label: "Gói nâng cấp",
      value: plansSummary.total,
      icon: SubscriptionsIcon,
      color: "from-emerald-500 to-emerald-600",
      footer: `Hoạt động: ${plansSummary.active}, Tạm dừng: ${plansSummary.inactive}`,
    },
    {
      key: "user_subs",
      label: "Gói người dùng",
      value: userSubsTotal,
      icon: ManagePackagesIcon,
      color: "from-purple-500 to-violet-600",
    },
    {
      key: "commission",
      label: "Hoa hồng chưa trả",
      value: loading
        ? "—"
        : unpaidCommissionTotal.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
      icon: CoinsIcon,
      color: "from-amber-500 to-amber-600",
      footer: `Bản ghi: ${loading ? "—" : unpaidCommissionCount}`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản trị hệ thống</h1>
            <p className="text-gray-500 mt-1 text-sm">Tổng quan & thao tác nhanh.</p>
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
            <button className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition">
              Xuất báo cáo
            </button>
          </div>
        </div>

        {/* Stats grid */}
        {error && (
          <div className="mb-4 p-3 rounded-lg border border-error-200 bg-error-50 text-error-700 text-sm">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((s) => (
            <div
              key={s.key}
              className="bg-white rounded-xl shadow-medium p-5 border border-gray-100 hover:shadow-large transition group"
            >
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center text-xl text-white mb-4 shadow`}
              >
                {(() => {
                  const Icon = s.icon;
                  return <Icon size={20} stroke={2} className="text-white" />;
                })()}
              </div>
              <div className="text-2xl font-bold text-gray-900 leading-tight">
                {loading ? "—" : s.value}
              </div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              {s.footer && <div className="text-xs text-gray-400 mt-1">{s.footer}</div>}
            </div>
          ))}
        </div>

        {/* Recent activities panel */}
        <div className="bg-white rounded-xl shadow-medium p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Hoạt động gần đây</h2>
          {activitiesLoading && (
            <div className="py-6 text-center text-sm text-gray-500">Đang tải hoạt động...</div>
          )}
          {!activitiesLoading && activities.length === 0 && (
            <div className="py-6 text-center text-sm text-gray-500">
              Chưa có hoạt động quản lý gần đây
            </div>
          )}
          <ul className="space-y-4">
            {activities.map((act) => (
              <li key={`${act.type}_${act.id}`} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800">{act.label}</p>
                    <span className="text-xs text-gray-400">
                      {act.dateIso ? new Date(act.dateIso).toLocaleString("vi-VN") : "—"}
                    </span>
                  </div>
                  {act.type === "subscription_purchase" && (
                    <div className="mt-1 text-xs text-gray-500">Trạng thái: {act.status}</div>
                  )}
                  {act.type === "commission_paid" && (
                    <div className="mt-1 text-xs text-gray-500">Hoa hồng đã thanh toán</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Charts */}
        {!loading && stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* User Distribution Chart */}
            <div className="bg-white rounded-xl shadow-medium p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Phân bố người dùng</h2>
              <div className="flex justify-center">
                <div style={{ maxWidth: "300px", width: "100%" }}>
                  <Doughnut
                    data={{
                      labels: ["Hoạt động", "Không hoạt động"],
                      datasets: [
                        {
                          data: [
                            stats.users?.active || 0,
                            (stats.users?.total || 0) - (stats.users?.active || 0),
                          ],
                          backgroundColor: ["rgba(16, 185, 129, 0.8)", "rgba(209, 213, 219, 0.8)"],
                          borderColor: ["rgba(16, 185, 129, 1)", "rgba(209, 213, 219, 1)"],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          position: "bottom",
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Content Statistics Chart */}
            <div className="bg-white rounded-xl shadow-medium p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Thống kê nội dung</h2>
              <Bar
                data={{
                  labels: ["Môn học", "Tài liệu", "Bộ câu hỏi", "Lượt thi"],
                  datasets: [
                    {
                      label: "Số lượng",
                      data: [
                        stats.content?.subjects || 0,
                        stats.content?.documents || 0,
                        stats.content?.questionSets || 0,
                        stats.content?.quizAttempts || 0,
                      ],
                      backgroundColor: [
                        "rgba(99, 102, 241, 0.8)",
                        "rgba(59, 130, 246, 0.8)",
                        "rgba(168, 85, 247, 0.8)",
                        "rgba(245, 158, 11, 0.8)",
                      ],
                      borderColor: [
                        "rgba(99, 102, 241, 1)",
                        "rgba(59, 130, 246, 1)",
                        "rgba(168, 85, 247, 1)",
                        "rgba(245, 158, 11, 1)",
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-medium p-6 flex flex-col">
            <h3 className="font-semibold text-gray-800 mb-2">Người dùng</h3>
            <p className="text-sm text-gray-500 mb-4">Quản lý danh sách và vai trò người dùng.</p>
            <Link
              to="/admin/users"
              className="mt-auto inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
            >
              Đi tới quản lý
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-medium p-6 flex flex-col">
            <h3 className="font-semibold text-gray-800 mb-2">Gói nâng cấp</h3>
            <p className="text-sm text-gray-500 mb-4">
              Tạo, chỉnh sửa, kích hoạt hay tạm dừng gói.
            </p>
            <Link
              to="/admin/subscription-plans"
              className="mt-auto inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
            >
              Quản lý gói nâng cấp
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-medium p-6 flex flex-col">
            <h3 className="font-semibold text-gray-800 mb-2">Gói người dùng</h3>
            <p className="text-sm text-gray-500 mb-4">
              Xem và theo dõi gói mà người dùng đang sở hữu.
            </p>
            <Link
              to="/admin/subscription-purchases"
              className="mt-auto inline-flex items-center justify-center px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition"
            >
              Quản lý gói
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-medium p-6 flex flex-col">
            <h3 className="font-semibold text-gray-800 mb-2">Hoa hồng</h3>
            <p className="text-sm text-gray-500 mb-4">Theo dõi & xử lý thanh toán hoa hồng.</p>
            <Link
              to="/admin/commission-records"
              className="mt-auto inline-flex items-center justify-center px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition"
            >
              Quản lý hoa hồng
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
