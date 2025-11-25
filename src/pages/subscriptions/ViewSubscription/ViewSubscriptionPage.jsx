/**
 * View Subscription Page
 * Display all subscription plans for Admin
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import subscriptionsService from "@/services/api/subscriptions.service";
import Button from "@/components/common/Button";

function ViewSubscriptionPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await subscriptionsService.getPlans();
      setPlans(response.data?.plans || []);
    } catch (err) {
      console.error("Error fetching plans:", err);
      let errorMessage = "Không thể tải danh sách gói đăng ký";

      if (err.code === "ERR_NETWORK" || err.message?.includes("Network Error")) {
        errorMessage =
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc khởi động backend.";
      } else if (err.response?.status === 404) {
        errorMessage = "Không tìm thấy API gói đăng ký.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatEntitlementLabel = (key) => {
    const labels = {
      maxSubjects: "Số môn học",
      maxMonthlyTestGenerations: "Số lần tạo đề/tháng",
      maxValidationRequests: "Số yêu cầu kiểm duyệt",
      priorityProcessing: "Xử lý ưu tiên",
      canShare: "Cho phép chia sẻ",
    };
    return labels[key] || key;
  };

  const formatEntitlementValue = (value) => {
    if (typeof value === "boolean") {
      return value ? "Có" : "Không";
    }
    if (typeof value === "object" && value !== null) {
      if (typeof value === "boolean") {
        return value ? "Có" : "Không";
      }
      return JSON.stringify(value);
    }
    if (value === -1) {
      return "Không giới hạn";
    }
    return value;
  };

  const getPlanIcon = (planName) => {
    if (planName.toLowerCase().includes("free")) return "🎁";
    if (planName.toLowerCase().includes("basic")) return "📦";
    if (planName.toLowerCase().includes("pro")) return "⭐";
    if (planName.toLowerCase().includes("premium")) return "👑";
    return "📋";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải danh sách gói đăng ký...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-2xl mx-auto mt-8">
            <p className="font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg px-6 py-6 mb-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">Các gói đăng ký</h1>
            <p className="text-lg text-gray-600">
              Xem tất cả các gói đăng ký hiện có trong hệ thống
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có gói đăng ký nào</h2>
            <p className="text-gray-600">Hiện tại chưa có gói đăng ký nào được kích hoạt.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isPro = plan.planName.toLowerCase().includes("pro");
              return (
                <div
                  key={plan.id || plan._id}
                  className={`group relative overflow-hidden rounded-2xl bg-white border-2 shadow-sm hover:shadow-lg transition-all duration-300 ${
                    isPro ? "border-primary-400" : "border-gray-200 hover:border-primary-200"
                  }`}
                >
                  {isPro && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md">
                        ⭐ Phổ biến nhất
                      </span>
                    </div>
                  )}

                  <div className="pointer-events-none absolute -top-6 -right-6 w-32 h-32 bg-primary-200/30 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity" />

                  <div className="relative p-8">
                    <div className="text-center mb-6">
                      <div className="text-6xl mb-4">{getPlanIcon(plan.planName)}</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{plan.planName}</h3>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-primary-600">
                          {formatPrice(plan.price)}
                        </span>
                        <span className="text-gray-600 text-lg">
                          /{plan.billingCycle === "Monthly" ? "tháng" : "năm"}
                        </span>
                      </div>
                    </div>

                    {plan.description && (
                      <p className="text-gray-600 text-center mb-6 min-h-[3rem]">
                        {plan.description}
                      </p>
                    )}

                    {plan.entitlements && (
                      <div className="mb-6 space-y-3">
                        <h4 className="font-semibold text-gray-900 text-center mb-4">
                          ✨ Quyền lợi:
                        </h4>
                        <ul className="space-y-2.5">
                          {Object.entries(plan.entitlements).map(([key, value]) => (
                            <li key={key} className="flex items-start gap-2.5">
                              <span className="text-primary-600 font-bold text-lg flex-shrink-0">
                                ✓
                              </span>
                              <span className="text-gray-700 text-sm leading-relaxed">
                                <span className="font-medium">{formatEntitlementLabel(key)}:</span>{" "}
                                {formatEntitlementValue(value)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Trạng thái:</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            plan.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {plan.status === "Active" ? "Đang hoạt động" : "Không hoạt động"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 text-sm">© 2025 Learinal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default ViewSubscriptionPage;
