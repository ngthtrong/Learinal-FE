import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import subscriptionsService from "@/services/api/subscriptions.service";
import paymentsService from "@/services/api/payments.service";
import Button from "@/components/common/Button";
import { Footer } from "@/components/layout";

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
      canShare: "Cho phép chia sẻ",
    };
    return labels[key] || key;
  };

  const formatEntitlementValue = (value) => {
    if (typeof value === "boolean") {
      return value ? "Có" : "Không";
    }
    if (typeof value === "object" && value !== null) {
      // Format boolean
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
    const name = planName.toLowerCase();
    if (name.includes("free")) return (
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-2xl"></div>
        <div className="absolute inset-1 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      </div>
    );
    if (name.includes("basic")) return (
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl"></div>
        <div className="absolute inset-1 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center">
          <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
      </div>
    );
    if (name.includes("pro")) return (
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg"></div>
        <div className="absolute inset-1 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center">
          <svg className="w-10 h-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>
    );
    if (name.includes("premium")) return (
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-xl"></div>
        <div className="absolute inset-1 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center">
          <svg className="w-10 h-10 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      </div>
    );
    return (
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl"></div>
        <div className="absolute inset-1 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Đang tải danh sách gói đăng ký...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg max-w-2xl mx-auto mt-8">
            <p className="font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Sắp xếp plans theo giá tăng dần (trái qua phải)
  const sortedPlans = [...plans].sort((a, b) => a.price - b.price);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:to-gray-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg px-4 sm:px-6 py-4 sm:py-6 mb-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">Các gói đăng ký</h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
              Chọn gói phù hợp với bạn để trải nghiệm đầy đủ tính năng
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 pb-6">
        {sortedPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-3xl"></div>
              <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Chưa có gói đăng ký nào</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Hiện tại chưa có gói đăng ký nào được kích hoạt. Vui lòng quay lại sau.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {sortedPlans.map((plan) => {
              const isPro = plan.planName.toLowerCase().includes("pro");
              return (
                <div
                  key={plan.id || plan._id}
                  className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border-2 shadow-sm hover:shadow-lg transition-all duration-300 ${
                    isPro ? "border-primary-400 dark:border-primary-500" : "border-gray-200 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-600"
                  }`}
                >
                  {isPro && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                        Phổ biến nhất
                      </span>
                    </div>
                  )}

                  {/* Decorative blob */}
                  <div className="pointer-events-none absolute -top-6 -right-6 w-24 h-24 bg-primary-200/30 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity" />

                  <div className="relative p-8">
                    <div className="text-center mb-6">
                      <div className="flex justify-center mb-4">{getPlanIcon(plan.planName)}</div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">{plan.planName}</h3>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                          {formatPrice(plan.price)}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 text-lg">
                          /{plan.billingCycle === "Monthly" ? "tháng" : "năm"}
                        </span>
                      </div>
                    </div>
                    {plan.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-center mb-6 min-h-[3rem]">
                        {plan.description}
                      </p>
                    )}
                    {plan.entitlements && (
                      <div className="mb-6 space-y-3">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-center mb-4">
                          Quyền lợi:
                        </h4>
                        <ul className="space-y-2">
                          {Object.entries(plan.entitlements).map(([key, value]) => (
                            <li key={key} className="flex items-start gap-2.5">
                              <span className="text-primary-600 dark:text-primary-400 font-bold text-lg flex-shrink-0">
                                ✓
                              </span>
                              <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
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
                      Chọn gói này
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Xác nhận đăng ký</h2>
              <button
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                onClick={() => setShowPaymentModal(false)}
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Gói:</span>
                <strong className="text-sm text-gray-900 dark:text-gray-100">{selectedPlan.planName}</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Giá:</span>
                <strong className="text-sm text-primary-600 dark:text-primary-400">
                  {formatPrice(selectedPlan.price)}
                </strong>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Chu kỳ:</span>
                <strong className="text-sm text-gray-900 dark:text-gray-100">
                  {selectedPlan.billingCycle === "Monthly" ? "Hàng tháng" : "Hàng năm"}
                </strong>
              </div>
            </div>

            <div className="px-4 pb-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p>
                Bạn có chắc chắn muốn đăng ký gói <strong>{selectedPlan.planName}</strong> không?
              </p>
              <p className="text-xs sm:text-sm">Sau khi xác nhận, bạn sẽ nhận được mã QR để thanh toán.</p>
            </div>

            <div className="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
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
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Quét mã QR để thanh toán</h2>
              <button
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                onClick={() => setShowQRModal(false)}
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex justify-center bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                {qrData.qrUrl ? (
                  <img src={qrData.qrUrl} alt="QR Code" className="w-48 h-48 object-contain" />
                ) : qrData.qrDataUrl ? (
                  <img src={qrData.qrDataUrl} alt="QR Code" className="w-48 h-48 object-contain" />
                ) : (
                  <div className="text-error-600 dark:text-red-400 text-center py-12">Không thể tải mã QR</div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">Thông tin thanh toán</h3>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Gói:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{qrData.plan?.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Số tiền:</span>
                  <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                    {formatPrice(qrData.amount)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Chu kỳ:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {qrData.plan?.billingCycle === "Monthly" ? "Hàng tháng" : "Hàng năm"}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-1 text-xs text-blue-800 dark:text-blue-300">
                <p>• Vui lòng quét mã QR bằng ứng dụng ngân hàng</p>
                <p>• Sau khi thanh toán thành công, hệ thống sẽ tự động kích hoạt gói của bạn</p>
              </div>
            </div>

            <div className="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
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
