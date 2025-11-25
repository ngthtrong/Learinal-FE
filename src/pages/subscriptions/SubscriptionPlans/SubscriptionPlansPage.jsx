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

  const formatEntitlementLabel = (key) => {
    const labels = {
      maxSubjects: "Số môn học",
      maxMonthlyTestGenerations: "Số lần tạo đề/tháng",
      maxValidationRequests: "Số yêu cầu kiểm duyệt",
      priorityProcessing: "Xử lý ưu tiên",
      shareLimits: "Giới hạn chia sẻ",
    };
    return labels[key] || key;
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
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 pt-4">
          <div className="flex items-center justify-center py-12 sm:py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-600 mx-auto mb-3"></div>
              <p className="text-gray-600 text-sm sm:text-base">Đang tải danh sách gói đăng ký...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 pt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 sm:px-6 sm:py-4 rounded-lg max-w-2xl mx-auto mt-6 sm:mt-8">
            <p className="font-medium text-sm sm:text-base">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 -mt-16">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 pt-4">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg px-4 py-4 mb-4">
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">🎯 Các gói đăng ký</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Chọn gói phù hợp với bạn để trải nghiệm đầy đủ tính năng
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 pb-6">
        {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có gói đăng ký nào</h2>
            <p className="text-gray-600">
              Hiện tại chưa có gói đăng ký nào được kích hoạt. Vui lòng quay lại sau.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {plans.map((plan) => {
              const isPro = plan.planName.toLowerCase().includes("pro");
              return (
                <div
                  key={plan.id || plan._id}
                  className={`group relative overflow-hidden rounded-xl bg-white border-2 shadow-sm hover:shadow-lg transition-all duration-300 ${
                    isPro ? "border-primary-400" : "border-gray-200 hover:border-primary-200"
                  }`}
                >
                  {isPro && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                        ⭐ Phổ biến nhất
                      </span>
                    </div>
                  )}

                  {/* Decorative blob */}
                  <div className="pointer-events-none absolute -top-6 -right-6 w-24 h-24 bg-primary-200/30 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity" />

                  <div className="relative p-4 sm:p-6">
                    <div className="text-center mb-4">
                      <div className="text-4xl sm:text-5xl mb-3">{getPlanIcon(plan.planName)}</div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{plan.planName}</h3>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-2xl sm:text-3xl font-bold text-primary-600">
                          {formatPrice(plan.price)}
                        </span>
                        <span className="text-gray-600 text-sm sm:text-base">
                          /{plan.billingCycle === "Monthly" ? "tháng" : "năm"}
                        </span>
                      </div>
                    </div>
                    {plan.description && (
                      <p className="text-gray-600 text-center text-sm mb-4 min-h-[2.5rem]">
                        {plan.description}
                      </p>
                    )}
                    {plan.entitlements && (
                      <div className="mb-4 space-y-2">
                        <h4 className="font-semibold text-gray-900 text-center text-sm mb-3">
                          ✨ Quyền lợi:
                        </h4>
                        <ul className="space-y-2">
                          {Object.entries(plan.entitlements).map(([key, value]) => (
                            <li key={key} className="flex items-start gap-2">
                              <span className="text-primary-600 font-bold text-base flex-shrink-0">
                                ✓
                              </span>
                              <span className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                                <span className="font-medium">{formatEntitlementLabel(key)}:</span>{" "}
                                {formatEntitlementValue(value)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <Button
                      onClick={() => handleSelectPlan(plan)}
                      variant={isPro ? "primary" : "secondary"}
                      className="w-full"
                    >
                      {isPro ? "🚀 Chọn gói này" : "Chọn gói này"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-8 py-6 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
          <p className="text-center text-gray-600 text-xs sm:text-sm">© 2025 Learinal. All rights reserved.</p>
        </div>
      </footer>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Xác nhận đăng ký</h2>
              <button
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
                onClick={() => setShowPaymentModal(false)}
              >
                ×
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm sm:text-base text-gray-600">Gói:</span>
                <strong className="text-sm sm:text-base text-gray-900">{selectedPlan.planName}</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm sm:text-base text-gray-600">Giá:</span>
                <strong className="text-sm sm:text-base text-primary-600">{formatPrice(selectedPlan.price)}</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm sm:text-base text-gray-600">Chu kỳ:</span>
                <strong className="text-sm sm:text-base text-gray-900">
                  {selectedPlan.billingCycle === "Monthly" ? "Hàng tháng" : "Hàng năm"}
                </strong>
              </div>
            </div>

            <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-2 text-sm sm:text-base text-gray-700">
              <p>
                Bạn có chắc chắn muốn đăng ký gói <strong>{selectedPlan.planName}</strong> không?
              </p>
              <p className="text-xs sm:text-sm">Sau khi xác nhận, bạn sẽ nhận được mã QR để thanh toán.</p>
            </div>

            <div className="flex gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200">
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto"
          onClick={() => setShowQRModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-base sm:text-xl font-bold text-gray-900">Quét mã QR để thanh toán</h2>
              <button
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
                onClick={() => setShowQRModal(false)}
              >
                ×
              </button>
            </div>

            <div className="p-3 sm:p-4 space-y-3">
              <div className="flex justify-center bg-gray-50 p-2 sm:p-3 rounded-lg">
                {qrData.qrUrl ? (
                  <img src={qrData.qrUrl} alt="QR Code" className="w-40 h-40 sm:w-48 sm:h-48 object-contain" />
                ) : qrData.qrDataUrl ? (
                  <img src={qrData.qrDataUrl} alt="QR Code" className="w-40 h-40 sm:w-48 sm:h-48 object-contain" />
                ) : (
                  <div className="text-error-600 text-center py-6 text-sm">Không thể tải mã QR</div>
                )}
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5">Thông tin thanh toán</h3>
                <div className="flex justify-between py-1.5 border-b border-gray-100 text-xs sm:text-sm">
                  <span className="text-gray-600">Gói:</span>
                  <span className="font-medium text-gray-900">{qrData.plan?.name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 text-xs sm:text-sm">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-bold text-primary-600">{formatPrice(qrData.amount)}</span>
                </div>
                <div className="flex justify-between py-1.5 text-xs sm:text-sm">
                  <span className="text-gray-600">Chu kỳ:</span>
                  <span className="font-medium text-gray-900">
                    {qrData.plan?.billingCycle === "Monthly" ? "Hàng tháng" : "Hàng năm"}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 sm:p-3 space-y-1 text-xs text-blue-800">
                <p>📱 Vui lòng quét mã QR bằng ứng dụng ngân hàng</p>
                <p>💡 Sau khi thanh toán thành công, hệ thống sẽ tự động kích hoạt gói của bạn</p>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200">
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
  );
}

export default SubscriptionPlansPage;
