/**
 * Subscription Plans Page
 * Display available subscription plans and pricing
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import subscriptionsService from "@/services/api/subscriptions.service";
import paymentsService from "@/services/api/payments.service";
import Button from "@/components/common/Button";
import "./SubscriptionPlansPage.css";

function SubscriptionPlansPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQRData] = useState(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [generatingQR, setGeneratingQR] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching plans...");
      const response = await subscriptionsService.getPlans();
      console.log("Plans response:", response);
      setPlans(response.data?.plans || []);
    } catch (err) {
      console.error("Error fetching plans:", err);
      let errorMessage = "Không thể tải danh sách gói đăng ký";
      
      if (err.code === "ERR_NETWORK" || err.message?.includes("Network Error")) {
        errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc khởi động backend.";
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

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
    setPaymentReference("");
    setQRData(null);
    setShowQRModal(false);
  };

  const handleConfirmPlan = async () => {
    if (!selectedPlan) return;

    try {
      setGeneratingQR(true);
      console.log("Generating QR for plan:", selectedPlan);
      
      // Gọi API qua paymentsService - axios sẽ tự động thêm accessToken
      // Backend đã map _id thành id, nên dùng plan.id
      const response = await paymentsService.generateSepayQR(selectedPlan.id || selectedPlan._id);
      console.log("QR response:", response);
      
      // Backend trả về { provider, amount, currency, plan, reference, qrUrl, qrDataUrl }
      setQRData(response);
      setShowPaymentModal(false);
      setShowQRModal(true);
    } catch (err) {
      console.error("Error generating QR:", err);
      
      let errorMessage = "Không thể tạo mã QR thanh toán";
      if (err.response?.status === 404) {
        errorMessage = "API thanh toán không tồn tại. Backend chưa chạy hoặc route sai.";
      } else if (err.response?.status === 401) {
        errorMessage = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || "Dữ liệu không hợp lệ.";
      } else if (err.code === "ERR_NETWORK" || err.message?.includes("Network Error")) {
        errorMessage = "Không thể kết nối đến server. Backend chưa chạy tại http://localhost:3000";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      alert(errorMessage);
    } finally {
      setGeneratingQR(false);
    }
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

  const getPlanIcon = (planName) => {
    if (planName.toLowerCase().includes("free")) return "🎁";
    if (planName.toLowerCase().includes("basic")) return "📦";
    if (planName.toLowerCase().includes("pro")) return "⭐";
    if (planName.toLowerCase().includes("premium")) return "👑";
    return "📋";
  };

  if (loading) {
    return (
      <div className="subscription-plans-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải danh sách gói đăng ký...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="subscription-plans-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="subscription-plans-page">
      <div className="plans-header">
        <h1>Chọn gói phù hợp với bạn</h1>
        <p className="plans-subtitle">
          Nâng cấp tài khoản để trải nghiệm đầy đủ tính năng
        </p>
      </div>

      {plans.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h2>Chưa có gói đăng ký nào</h2>
          <p>Hiện tại chưa có gói đăng ký nào được kích hoạt. Vui lòng quay lại sau.</p>
        </div>
      ) : (
        <div className="plans-grid">
          {plans.map((plan) => (
            <div
              key={plan.id || plan._id}
              className={`plan-card ${
                plan.planName.toLowerCase().includes("pro") ? "featured" : ""
              }`}
            >
              {plan.planName.toLowerCase().includes("pro") && (
                <div className="featured-badge">Phổ biến nhất</div>
              )}

              <div className="plan-icon">{getPlanIcon(plan.planName)}</div>
              <h3 className="plan-name">{plan.planName}</h3>
              <div className="plan-price">
                <span className="price-amount">{formatPrice(plan.price)}</span>
                <span className="price-cycle">
                  /{plan.billingCycle === "Monthly" ? "tháng" : "năm"}
                </span>
              </div>

              {plan.description && (
                <p className="plan-description">{plan.description}</p>
              )}

              {plan.entitlements && (
                <div className="plan-features">
                  <h4>Tính năng:</h4>
                  <ul>
                    {Object.entries(plan.entitlements).map(([key, value]) => (
                      <li key={key}>
                        <span className="feature-icon">✓</span>
                        <span>
                          {key}: {formatEntitlementValue(value)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                onClick={() => handleSelectPlan(plan)}
                variant={
                  plan.planName.toLowerCase().includes("pro")
                    ? "primary"
                    : "secondary"
                }
                className="plan-button"
              >
                Chọn gói này
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div
          className="modal-overlay"
          onClick={() => setShowPaymentModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Xác nhận đăng ký</h2>
              <button
                className="modal-close"
                onClick={() => setShowPaymentModal(false)}
              >
                ×
              </button>
            </div>

            <div className="payment-summary">
              <div className="summary-item">
                <span>Gói:</span>
                <strong>{selectedPlan.planName}</strong>
              </div>
              <div className="summary-item">
                <span>Giá:</span>
                <strong>{formatPrice(selectedPlan.price)}</strong>
              </div>
              <div className="summary-item">
                <span>Chu kỳ:</span>
                <strong>
                  {selectedPlan.billingCycle === "Monthly" ? "Hàng tháng" : "Hàng năm"}
                </strong>
              </div>
            </div>

            <div className="modal-description">
              <p>Bạn có chắc chắn muốn đăng ký gói <strong>{selectedPlan.planName}</strong> không?</p>
              <p>Sau khi xác nhận, bạn sẽ nhận được mã QR để thanh toán.</p>
            </div>

            <div className="modal-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowPaymentModal(false)}
                disabled={generatingQR}
              >
                Hủy
              </Button>
              <Button 
                onClick={handleConfirmPlan} 
                loading={generatingQR}
              >
                {generatingQR ? "Đang tạo QR..." : "Xác nhận"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && qrData && (
        <div
          className="modal-overlay"
          onClick={() => setShowQRModal(false)}
        >
          <div className="modal-content qr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Quét mã QR để thanh toán</h2>
              <button
                className="modal-close"
                onClick={() => setShowQRModal(false)}
              >
                ×
              </button>
            </div>

            <div className="qr-content">
              <div className="qr-image-container">
                {qrData.qrUrl ? (
                  <img 
                    src={qrData.qrUrl} 
                    alt="QR Code" 
                    className="qr-image"
                  />
                ) : qrData.qrDataUrl ? (
                  <img 
                    src={qrData.qrDataUrl} 
                    alt="QR Code" 
                    className="qr-image"
                  />
                ) : (
                  <div className="qr-error">Không thể tải mã QR</div>
                )}
              </div>

              <div className="qr-info">
                <h3>Thông tin thanh toán</h3>
                <div className="info-item">
                  <span className="label">Gói:</span>
                  <span className="value">{qrData.plan?.name}</span>
                </div>
                <div className="info-item">
                  <span className="label">Số tiền:</span>
                  <span className="value">{formatPrice(qrData.amount)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Chu kỳ:</span>
                  <span className="value">
                    {qrData.plan?.billingCycle === "Monthly" ? "Hàng tháng" : "Hàng năm"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Mã tham chiếu:</span>
                  <span className="value reference">{qrData.reference}</span>
                </div>
              </div>

              <div className="qr-instructions">
                <p>📱 Vui lòng quét mã QR bằng ứng dụng ngân hàng</p>
                <p>💡 Sau khi thanh toán thành công, hệ thống sẽ tự động kích hoạt gói của bạn</p>
              </div>
            </div>

            <div className="modal-actions">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowQRModal(false);
                  navigate("/subscriptions/me");
                }}
              >
                Đã thanh toán
              </Button>
              <Button
                onClick={() => setShowQRModal(false)}
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubscriptionPlansPage;
