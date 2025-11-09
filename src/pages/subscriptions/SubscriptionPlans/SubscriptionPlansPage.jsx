/**
 * Subscription Plans Page
 * Display available subscription plans and pricing
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import subscriptionsService from "@/services/api/subscriptions.service";
import paymentsService from "@/services/api/payments.service";
import Button from "@/components/common/Button";
function SubscriptionPlansPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQRData] = useState(null);
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

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách gói đăng ký...</p>
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

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 to-secondary-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Chọn gói phù hợp với bạn</h1>
          <p className="text-xl text-gray-600">
            Nâng cấp tài khoản để trải nghiệm đầy đủ tính năng
          </p>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có gói đăng ký nào</h2>
            <p className="text-gray-600">
              Hiện tại chưa có gói đăng ký nào được kích hoạt. Vui lòng quay lại sau.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id || plan._id}
                className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8 ${
                  plan.planName.toLowerCase().includes("pro") ? "ring-2 ring-primary-500" : ""
                }`}
              >
                {plan.planName.toLowerCase().includes("pro") && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Phổ biến nhất
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{getPlanIcon(plan.planName)}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.planName}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-primary-600">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-gray-600">
                      /{plan.billingCycle === "Monthly" ? "tháng" : "năm"}
                    </span>
                  </div>
                </div>

                {plan.description && (
                  <p className="text-gray-600 text-center mb-6">{plan.description}</p>
                )}

                {plan.entitlements && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Tính năng:</h4>
                    <ul className="space-y-2">
                      {Object.entries(plan.entitlements).map(([key, value]) => (
                        <li key={key} className="flex items-start gap-2">
                          <span className="text-success-600 font-bold mt-1">✓</span>
                          <span className="text-gray-700 text-sm">
                            {key}: {formatEntitlementValue(value)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  onClick={() => handleSelectPlan(plan)}
                  variant={plan.planName.toLowerCase().includes("pro") ? "primary" : "secondary"}
                  className="w-full"
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPaymentModal(false)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Xác nhận đăng ký</h2>
                <button
                  className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
                  onClick={() => setShowPaymentModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Gói:</span>
                  <strong className="text-gray-900">{selectedPlan.planName}</strong>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Giá:</span>
                  <strong className="text-primary-600">{formatPrice(selectedPlan.price)}</strong>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Chu kỳ:</span>
                  <strong className="text-gray-900">
                    {selectedPlan.billingCycle === "Monthly" ? "Hàng tháng" : "Hàng năm"}
                  </strong>
                </div>
              </div>

              <div className="px-6 pb-6 space-y-2 text-gray-700">
                <p>
                  Bạn có chắc chắn muốn đăng ký gói <strong>{selectedPlan.planName}</strong> không?
                </p>
                <p>Sau khi xác nhận, bạn sẽ nhận được mã QR để thanh toán.</p>
              </div>

              <div className="flex gap-3 p-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={generatingQR}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button onClick={handleConfirmPlan} loading={generatingQR} className="flex-1">
                  {generatingQR ? "Đang tạo QR..." : "Xác nhận"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {showQRModal && qrData && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowQRModal(false)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Quét mã QR để thanh toán</h2>
                <button
                  className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
                  onClick={() => setShowQRModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex justify-center bg-gray-50 p-6 rounded-lg">
                  {qrData.qrUrl ? (
                    <img src={qrData.qrUrl} alt="QR Code" className="w-64 h-64 object-contain" />
                  ) : qrData.qrDataUrl ? (
                    <img
                      src={qrData.qrDataUrl}
                      alt="QR Code"
                      className="w-64 h-64 object-contain"
                    />
                  ) : (
                    <div className="text-error-600 text-center py-12">Không thể tải mã QR</div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Thông tin thanh toán</h3>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Gói:</span>
                    <span className="font-medium text-gray-900">{qrData.plan?.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Số tiền:</span>
                    <span className="font-bold text-primary-600">{formatPrice(qrData.amount)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Chu kỳ:</span>
                    <span className="font-medium text-gray-900">
                      {qrData.plan?.billingCycle === "Monthly" ? "Hàng tháng" : "Hàng năm"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Mã tham chiếu:</span>
                    <span className="font-mono text-sm font-medium text-gray-900">
                      {qrData.reference}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2 text-sm text-blue-800">
                  <p>📱 Vui lòng quét mã QR bằng ứng dụng ngân hàng</p>
                  <p>💡 Sau khi thanh toán thành công, hệ thống sẽ tự động kích hoạt gói của bạn</p>
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t border-gray-200">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowQRModal(false);
                    navigate("/subscriptions/me");
                  }}
                  className="flex-1"
                >
                  Đã thanh toán
                </Button>
                <Button onClick={() => setShowQRModal(false)} className="flex-1">
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubscriptionPlansPage;
