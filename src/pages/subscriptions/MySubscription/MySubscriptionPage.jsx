/**
 * My Subscription Page
 * Display current user subscription status and details
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import subscriptionsService from "@/services/api/subscriptions.service";
import Button from "@/components/common/Button";
function MySubscriptionPage() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await subscriptionsService.getMySubscription();
      setSubscription(response.data?.subscription || null);
    } catch (err) {
      if (err.response?.status === 404) {
        setSubscription(null);
      } else {
        let errorMessage = "Không thể tải thông tin gói đăng ký";

        if (err.code === "ERR_NETWORK" || err.message?.includes("Network Error")) {
          errorMessage =
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc khởi động backend.";
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }

        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    const subscriptionId = subscription?.id || subscription?._id;
    if (!subscriptionId) return;

    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn hủy gói đăng ký? Bạn sẽ vẫn có quyền truy cập đến hết ngày hết hạn."
    );

    if (!confirmed) return;

    try {
      setCancelling(true);
      await subscriptionsService.cancelSubscription(subscriptionId);
      alert("Hủy gói đăng ký thành công!");
      // Sau khi hủy, subscription status sẽ không còn Active nữa
      // Reload để hiển thị thông báo phù hợp
      fetchSubscription();
    } catch (err) {
      alert(err.response?.data?.message || "Không thể hủy gói đăng ký");
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatEntitlementValue = (value) => {
    if (typeof value === "boolean") {
      return value ? "Có" : "Không";
    }
    if (typeof value === "object" && value !== null) {
      // Format object như {canShare: true, maxSharedUsers: 3}
      if (value.canShare !== undefined && value.maxSharedUsers !== undefined) {
        return `${value.canShare ? "Có" : "Không"} (tối đa ${value.maxSharedUsers} người)`;
      }
      return JSON.stringify(value);
    }
    if (value === -1) {
      return "Không giới hạn";
    }
    return value;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Active: { text: "Đang hoạt động", className: "bg-success-100 text-success-800" },
      Expired: { text: "Đã hết hạn", className: "bg-gray-100 text-gray-800" },
      Cancelled: { text: "Đã hủy", className: "bg-error-100 text-error-800" },
      PendingPayment: { text: "Chờ thanh toán", className: "bg-warning-100 text-warning-800" },
    };

    const statusInfo = statusMap[status] || {
      text: status,
      className: "bg-gray-100 text-gray-800",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.className}`}>
        {statusInfo.text}
      </span>
    );
  };

  const getStatusText = (status) => {
    const statusMap = {
      Active: "Đang hoạt động",
      Expired: "Đã hết hạn",
      Cancelled: "Đã hủy",
      PendingPayment: "Chờ thanh toán",
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải thông tin gói đăng ký...</p>
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

  if (!subscription) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg px-6 py-6 mb-6">
            <h1 className="text-4xl font-bold text-gray-900">💳 Gói đăng ký của tôi</h1>
          </div>
        </div>

        {/* Empty State */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có gói đăng ký</h2>
            <p className="text-gray-600 text-center mb-6 max-w-md">
              Bạn chưa đăng ký gói nào. Hãy chọn một gói phù hợp để bắt đầu!
            </p>
            <Button onClick={() => navigate("/subscriptions/plans")}>Xem các gói đăng ký</Button>
          </div>
        </div>
      </div>
    );
  }

  // Chỉ hiển thị subscription khi status là Active
  if (subscription.status !== "Active") {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg px-6 py-6 mb-6">
            <h1 className="text-4xl font-bold text-gray-900">💳 Gói đăng ký của tôi</h1>
          </div>
        </div>

        {/* Inactive State */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Gói đăng ký không hoạt động</h2>
            <div className="mb-4">{getStatusBadge(subscription.status)}</div>
            {subscription.status === "PendingPayment" && (
              <p className="text-gray-600 text-center mb-6">
                Vui lòng hoàn tất thanh toán để kích hoạt gói.
              </p>
            )}
            {subscription.status === "Expired" && (
              <p className="text-gray-600 text-center mb-6">
                Gói đăng ký của bạn đã hết hạn. Vui lòng gia hạn hoặc chọn gói mới.
              </p>
            )}
            {subscription.status === "Cancelled" && (
              <p className="text-gray-600 text-center mb-6">Gói đăng ký của bạn đã bị hủy.</p>
            )}
            <Button onClick={() => navigate("/subscriptions/plans")}>Xem các gói đăng ký</Button>
          </div>
        </div>
      </div>
    );
  }

  // Nếu đã qua điều kiện trên, subscription.status === "Active"
  const plan = subscription.plan;

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg px-6 py-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-gray-900">💳 Gói đăng ký của tôi</h1>
              <p className="text-lg text-gray-600">Thông tin chi tiết về gói đăng ký hiện tại</p>
            </div>
            <Button variant="secondary" onClick={() => navigate("/subscriptions/plans")}>
              Xem các gói khác
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Plan Header */}
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-3xl font-bold mb-3">{plan?.planName || "Gói đăng ký"}</h2>
                {getStatusBadge(subscription.status)}
              </div>
              <div className="text-left sm:text-right">
                <div className="text-5xl font-bold mb-1">{formatPrice(plan?.price || 0)}</div>
                <div className="text-white/90 text-lg">
                  /{plan?.billingCycle === "Monthly" ? "tháng" : "năm"}
                </div>
              </div>
            </div>
            {plan?.description && (
              <p className="text-white/90 text-lg max-w-2xl">{plan.description}</p>
            )}
          </div>

          {/* Subscription Details */}
          <div className="p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Thông tin gói</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <span className="text-gray-600 text-sm block mb-1">Tên gói</span>
                <span className="font-semibold text-gray-900 text-lg">
                  {plan?.planName || "N/A"}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <span className="text-gray-600 text-sm block mb-1">Chu kỳ thanh toán</span>
                <span className="font-semibold text-gray-900 text-lg">
                  {plan?.billingCycle === "Monthly" ? "Hàng tháng" : "Hàng năm"}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <span className="text-gray-600 text-sm block mb-1">Ngày bắt đầu</span>
                <span className="font-semibold text-gray-900 text-lg">
                  {formatDate(subscription.startDate)}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <span className="text-gray-600 text-sm block mb-1">Ngày hết hạn</span>
                <span className="font-semibold text-gray-900 text-lg">
                  {formatDate(subscription.endDate)}
                </span>
              </div>
              {subscription.renewalDate && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <span className="text-gray-600 text-sm block mb-1">Ngày gia hạn</span>
                  <span className="font-semibold text-gray-900 text-lg">
                    {formatDate(subscription.renewalDate)}
                  </span>
                </div>
              )}
            </div>

            {/* Entitlements */}
            {subscription.entitlementsSnapshot && (
              <div className="border-t border-gray-200 pt-8 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">✨ Quyền lợi của gói</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(subscription.entitlementsSnapshot).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-start gap-3 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg p-4 border border-primary-100"
                    >
                      <span className="text-primary-600 font-bold text-xl">✓</span>
                      <div className="flex-1">
                        <span className="text-gray-900 font-semibold block">{key}</span>
                        <span className="text-gray-600 text-sm">
                          {formatEntitlementValue(value)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="border-t border-gray-200 pt-6 flex justify-end">
              <Button variant="danger" onClick={handleCancelSubscription} loading={cancelling}>
                Hủy gói đăng ký
              </Button>
            </div>
          </div>
        </div>
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

export default MySubscriptionPage;
