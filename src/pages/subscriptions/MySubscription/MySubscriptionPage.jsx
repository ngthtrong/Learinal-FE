/**
 * My Subscription Page
 * Display current user subscription status and details
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import subscriptionsService from "@/services/api/subscriptions.service";
import Button from "@/components/common/Button";
import "./MySubscriptionPage.css";

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
      Active: { text: "Đang hoạt động", className: "status-active" },
      Expired: { text: "Đã hết hạn", className: "status-expired" },
      Cancelled: { text: "Đã hủy", className: "status-cancelled" },
      PendingPayment: { text: "Chờ thanh toán", className: "status-pending" },
    };

    const statusInfo = statusMap[status] || { text: status, className: "" };
    return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.text}</span>;
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
      <div className="my-subscription-page">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-subscription-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="my-subscription-page">
        <div className="no-subscription">
          <div className="no-subscription-icon">📦</div>
          <h2>Chưa có gói đăng ký</h2>
          <p>Bạn chưa đăng ký gói nào. Hãy chọn một gói phù hợp để bắt đầu!</p>
          <Button onClick={() => navigate("/subscriptions/plans")}>Xem các gói đăng ký</Button>
        </div>
      </div>
    );
  }

  // Chỉ hiển thị subscription khi status là Active
  if (subscription.status !== "Active") {
    return (
      <div className="my-subscription-page">
        <div className="no-subscription">
          <div className="no-subscription-icon">⚠️</div>
          <h2>Gói đăng ký không hoạt động</h2>
          <p>
            Gói đăng ký của bạn hiện đang ở trạng thái:{" "}
            <strong>{getStatusText(subscription.status)}</strong>
          </p>
          {subscription.status === "PendingPayment" && (
            <p>Vui lòng hoàn tất thanh toán để kích hoạt gói.</p>
          )}
          {subscription.status === "Expired" && (
            <p>Gói đăng ký của bạn đã hết hạn. Vui lòng gia hạn hoặc chọn gói mới.</p>
          )}
          {subscription.status === "Cancelled" && <p>Gói đăng ký của bạn đã bị hủy.</p>}
          <Button onClick={() => navigate("/subscriptions/plans")}>Xem các gói đăng ký</Button>
        </div>
      </div>
    );
  }

  // Nếu đã qua điều kiện trên, subscription.status === "Active"
  const plan = subscription.planId;

  return (
    <div className="my-subscription-page">
      <div className="page-header">
        <h1>Gói đăng ký của tôi</h1>
        <Button variant="secondary" onClick={() => navigate("/subscriptions/plans")}>
          Xem các gói khác
        </Button>
      </div>

      <div className="subscription-card">
        <div className="subscription-header">
          <div className="plan-info">
            <h2>{plan?.planName || "Gói đăng ký"}</h2>
            {getStatusBadge(subscription.status)}
          </div>
          <div className="plan-price">
            <span className="price-amount">{formatPrice(plan?.price || 0)}</span>
            <span className="price-cycle">
              /{plan?.billingCycle === "Monthly" ? "tháng" : "năm"}
            </span>
          </div>
        </div>

        {plan?.description && <p className="plan-description">{plan.description}</p>}

        <div className="subscription-details">
          <div className="detail-row">
            <span className="detail-label">Ngày bắt đầu:</span>
            <span className="detail-value">{formatDate(subscription.startDate)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Ngày hết hạn:</span>
            <span className="detail-value">{formatDate(subscription.endDate)}</span>
          </div>
          {subscription.renewalDate && (
            <div className="detail-row">
              <span className="detail-label">Ngày gia hạn:</span>
              <span className="detail-value">{formatDate(subscription.renewalDate)}</span>
            </div>
          )}
          <div className="detail-row">
            <span className="detail-label">Chu kỳ thanh toán:</span>
            <span className="detail-value">
              {plan?.billingCycle === "Monthly" ? "Hàng tháng" : "Hàng năm"}
            </span>
          </div>
        </div>

        {/* Entitlements */}
        {subscription.entitlementsSnapshot && (
          <div className="entitlements-section">
            <h3>Quyền lợi của gói</h3>
            <div className="entitlements-grid">
              {Object.entries(subscription.entitlementsSnapshot).map(([key, value]) => (
                <div key={key} className="entitlement-item">
                  <span className="entitlement-icon">✓</span>
                  <div className="entitlement-content">
                    <span className="entitlement-key">{key}:</span>
                    <span className="entitlement-value">{formatEntitlementValue(value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions - Chỉ hiển thị nút hủy vì status = Active */}
        <div className="subscription-actions">
          <Button variant="danger" onClick={handleCancelSubscription} loading={cancelling}>
            Hủy gói đăng ký
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MySubscriptionPage;
