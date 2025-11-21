/**
 * Expert Dashboard Page
 * Overview for expert users
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ShieldCheckIcon from "@/components/icons/ShieldCheckIcon";
import CoinsIcon from "@/components/icons/CoinsIcon";
import { validationRequestsService } from "@/services/api";

function ExpertDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch stats (mock or real if endpoint exists)
      // For now, we'll derive some stats or fetch from separate endpoints
      const [requestsRes] = await Promise.all([
        validationRequestsService.list({ page: 1, pageSize: 5, status: "Pending" }),
        // commissionRecordsService.list({ page: 1, pageSize: 1 }), // Just to get total? Or maybe a stats endpoint is better
      ]);

      const pendingCount = requestsRes.meta?.total || 0;

      // Mocking some stats for now until backend has dedicated stats endpoint for expert
      setStats({
        pendingRequests: pendingCount,
        completedReviews: 0, // Need endpoint
        totalCommission: 0, // Need endpoint
      });

      setRecentRequests(requestsRes.items || []);
    } catch (err) {
      console.error("Failed to load expert dashboard", err);
      setError("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      key: "pending",
      label: "Yêu cầu chờ duyệt",
      value: stats?.pendingRequests ?? 0,
      icon: ShieldCheckIcon,
      color: "from-blue-500 to-blue-600",
      to: "/expert/requests",
    },
    {
      key: "commission",
      label: "Tổng thu nhập",
      value: (stats?.totalCommission ?? 0).toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      }),
      icon: CoinsIcon,
      color: "from-amber-500 to-amber-600",
      to: "/expert/commissions",
    },
    {
      key: "history",
      label: "Đã kiểm duyệt",
      value: stats?.completedReviews ?? 0,
      icon: ShieldCheckIcon,
      color: "from-green-500 to-green-600",
      to: "/expert/history",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Chuyên gia</h1>
          <p className="text-gray-500 mt-1">Chào mừng trở lại, hãy kiểm tra các yêu cầu mới.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {cards.map((card) => (
            <Link
              key={card.key}
              to={card.to}
              className="block bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center text-white`}
                >
                  <card.icon size={24} />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : card.value}
                </span>
              </div>
              <div className="text-gray-600 font-medium">{card.label}</div>
            </Link>
          ))}
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Yêu cầu mới nhất</h2>
            <Link
              to="/expert/requests"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Xem tất cả
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Đang tải...</div>
          ) : recentRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Không có yêu cầu nào đang chờ.</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-6 hover:bg-gray-50 transition flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {req.questionSetTitle || "Bộ câu hỏi không tên"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Gửi bởi: {req.requesterName} •{" "}
                      {new Date(req.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <Link
                    to={`/expert/requests/${req.id}`}
                    className="px-4 py-2 rounded-lg bg-primary-50 text-primary-700 font-medium text-sm hover:bg-primary-100 transition"
                  >
                    Kiểm duyệt
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExpertDashboardPage;
