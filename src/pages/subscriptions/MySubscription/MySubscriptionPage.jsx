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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-error-50 border border-error-200 text-error-800 px-6 py-4 rounded-lg max-w-md">
          {error}
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-6 p-8">
          <div className="text-8xl">📦</div>
          <h2 className="text-2xl font-bold text-gray-900">Chưa có gói đăng ký</h2>
          <p className="text-gray-600 max-w-md">
            Bạn chưa đăng ký gói nào. Hãy chọn một gói phù hợp để bắt đầu!
          </p>
          <Button onClick={() => navigate("/subscriptions/plans")}>Xem các gói đăng ký</Button>
        </div>
      </div>
    );
  }

  // Chỉ hiển thị subscription khi status là Active
  if (subscription.status !== "Active") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-6 p-8 max-w-md">
          <div className="text-8xl">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900">Gói đăng ký không hoạt động</h2>
          <p className="text-gray-700">
            Gói đăng ký của bạn hiện đang ở trạng thái:{" "}
            <strong>{getStatusText(subscription.status)}</strong>
          </p>
          {subscription.status === "PendingPayment" && (
            <p className="text-gray-600">Vui lòng hoàn tất thanh toán để kích hoạt gói.</p>
          )}
          {subscription.status === "Expired" && (
            <p className="text-gray-600">
              Gói đăng ký của bạn đã hết hạn. Vui lòng gia hạn hoặc chọn gói mới.
            </p>
          )}
          {subscription.status === "Cancelled" && (
            <p className="text-gray-600">Gói đăng ký của bạn đã bị hủy.</p>
          )}
          <Button onClick={() => navigate("/subscriptions/plans")}>Xem các gói đăng ký</Button>
        </div>
      </div>
    );
  }

  // Nếu đã qua điều kiện trên, subscription.status === "Active"
  const plan = subscription.planId;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gói đăng ký của tôi</h1>
          <Button variant="secondary" onClick={() => navigate("/subscriptions/plans")}>
            Xem các gói khác
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-medium overflow-hidden">
          <div className="bg-linear-to-r from-primary-500 to-secondary-500 p-8 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{plan?.planName || "Gói đăng ký"}</h2>
                {getStatusBadge(subscription.status)}
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{formatPrice(plan?.price || 0)}</div>
                <div className="text-white/80">
                  /{plan?.billingCycle === "Monthly" ? "tháng" : "năm"}
                </div>
              </div>
            </div>

            {plan?.description && <p className="text-white/90">{plan.description}</p>}
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Ngày bắt đầu:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(subscription.startDate)}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Ngày hết hạn:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(subscription.endDate)}
                </span>
              </div>
              {subscription.renewalDate && (
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Ngày gia hạn:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(subscription.renewalDate)}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Chu kỳ thanh toán:</span>
                <span className="font-medium text-gray-900">
                  {plan?.billingCycle === "Monthly" ? "Hàng tháng" : "Hàng năm"}
                </span>
              </div>
            </div>

            {/* Entitlements */}
            {subscription.entitlementsSnapshot && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quyền lợi của gói</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(subscription.entitlementsSnapshot).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
                      <span className="text-success-600 font-bold">✓</span>
                      <div className="flex-1">
                        <span className="text-gray-700 font-medium">{key}:</span>
                        <span className="text-gray-600 ml-1">{formatEntitlementValue(value)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions - Chỉ hiển thị nút hủy vì status = Active */}
            <div className="border-t border-gray-200 pt-6 flex justify-end">
              <Button variant="danger" onClick={handleCancelSubscription} loading={cancelling}>
                Hủy gói đăng ký
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MySubscriptionPage;
