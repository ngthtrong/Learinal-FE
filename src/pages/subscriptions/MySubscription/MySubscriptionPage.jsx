/**
 * My Subscription Page
 * Display current user subscription status and details
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import subscriptionsService from "@/services/api/subscriptions.service";
import addonPackagesService from "@/services/api/addonPackages.service";
import Button from "@/components/common/Button";
function MySubscriptionPage() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [addonQuota, setAddonQuota] = useState({ totalTestGenerations: 0, totalValidationRequests: 0 });
  const [usageStats, setUsageStats] = useState({
    usedTestGenerations: 0,
    usedValidationRequests: 0,
    maxTestGenerations: 0,
    maxValidationRequests: 0,
    addonTestGenerations: 0,
    addonValidationRequests: 0,
    addonPurchasedTestGenerations: 0,
    addonPurchasedValidationRequests: 0
  });

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await subscriptionsService.getMySubscription();
      console.log("Subscription data:", response.data?.subscription);
      console.log("Status:", response.data?.subscription?.status);
      setSubscription(response.data?.subscription || null);

      // Fetch addon quota và usage stats đồng thời
      const [quotaRes, usageRes] = await Promise.all([
        addonPackagesService.getMyQuota().catch(() => ({ data: { totalTestGenerations: 0, totalValidationRequests: 0 } })),
        subscriptionsService.getMyUsage().catch(() => ({ data: {} }))
      ]);
      
      setAddonQuota(quotaRes?.data || { totalTestGenerations: 0, totalValidationRequests: 0 });
      if (usageRes?.data) {
        setUsageStats(usageRes.data);
      }
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
      const cancelResponse = await subscriptionsService.cancelSubscription(subscriptionId);
      console.log("Cancel response:", cancelResponse);
      alert("Hủy gói đăng ký thành công!");
      // Sau khi hủy, subscription status sẽ không còn Active nữa
      // Reload để hiển thị thông báo phù hợp
      await fetchSubscription();
    } catch (err) {
      console.error("Cancel error:", err);
      console.error("Error response:", err.response?.data);
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

  const getStatusBadge = (status) => {
    const statusMap = {
      Active: { text: "Đang hoạt động", className: "bg-success-100 dark:bg-green-900/30 text-success-800 dark:text-green-300" },
      Expired: { text: "Đã hết hạn", className: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300" },
      Canceled: { text: "Đã hủy", className: "bg-error-100 dark:bg-red-900/30 text-error-800 dark:text-red-300" },
      PendingPayment: { text: "Chờ thanh toán", className: "bg-warning-100 dark:bg-yellow-900/30 text-warning-800 dark:text-yellow-300" },
    };

    const statusInfo = statusMap[status] || {
      text: status,
      className: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300",
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
      Canceled: "Đã hủy",
      PendingPayment: "Chờ thanh toán",
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin gói đăng ký...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg max-w-2xl mx-auto mt-8">
            <p className="font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:to-gray-900">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg px-6 py-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Gói đăng ký của tôi</h1>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-3xl flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Chưa có gói đăng ký</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
              Bạn chưa đăng ký gói nào. Hãy chọn một gói phù hợp để bắt đầu!
            </p>
            <Button onClick={() => navigate("/subscriptions/plans")}>Xem các gói đăng ký</Button>
          </div>
        </div>
      </div>
    );
  }

  // Nếu gói đã hủy hoặc hết hạn, hiển thị như chưa có gói
  if (subscription.status === "Canceled" || subscription.status === "Expired") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:to-gray-900">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg px-6 py-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl"></div>
                <div className="absolute inset-0.5 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Gói đăng ký của tôi</h1>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-3xl flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Chưa có gói đăng ký</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
              Bạn chưa đăng ký gói nào. Hãy chọn một gói phù hợp để bắt đầu!
            </p>
            <Button onClick={() => navigate("/subscriptions/plans")}>Xem các gói đăng ký</Button>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị thông báo cho PendingPayment
  if (subscription.status === "PendingPayment") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:to-gray-900">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg px-6 py-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Gói đăng ký của tôi</h1>
            </div>
          </div>
        </div>

        {/* Pending Payment State */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-3xl flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Chờ thanh toán</h2>
            <div className="mb-4">{getStatusBadge(subscription.status)}</div>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
              Vui lòng hoàn tất thanh toán để kích hoạt gói.
            </p>
            <Button onClick={() => navigate("/subscriptions/plans")}>Xem các gói đăng ký</Button>
          </div>
        </div>
      </div>
    );
  }

  // Nếu status không phải Active, hiển thị như chưa có gói
  if (subscription.status !== "Active") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:to-gray-900">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg px-6 py-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Gói đăng ký của tôi</h1>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-3xl flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Chưa có gói đăng ký</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
              Bạn chưa đăng ký gói nào. Hãy chọn một gói phù hợp để bắt đầu!
            </p>
            <Button onClick={() => navigate("/subscriptions/plans")}>Xem các gói đăng ký</Button>
          </div>
        </div>
      </div>
    );
  }

  // Nếu đã qua điều kiện trên, subscription.status === "Active"
  const plan = subscription.plan;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:to-gray-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg px-6 py-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Gói đăng ký của tôi</h1>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400">Thông tin chi tiết về gói đăng ký hiện tại</p>
            </div>
            <Button variant="secondary" onClick={() => navigate("/subscriptions/plans")}>
              Xem các gói khác
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
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
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Thông tin gói</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <span className="text-gray-600 dark:text-gray-400 text-sm block mb-1">Tên gói</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                  {plan?.planName || "N/A"}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 dark:bg-gray-700/50">
                <span className="text-gray-600 dark:text-gray-400 text-sm block mb-1">Chu kỳ thanh toán</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                  {plan?.billingCycle === "Monthly" ? "Hàng tháng" : "Hàng năm"}
                </span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <span className="text-gray-600 dark:text-gray-400 text-sm block mb-1">Ngày bắt đầu</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                  {formatDate(subscription.startDate)}
                </span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <span className="text-gray-600 dark:text-gray-400 text-sm block mb-1">Ngày hết hạn</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                  {formatDate(subscription.endDate)}
                </span>
              </div>
              {subscription.renewalDate && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <span className="text-gray-600 dark:text-gray-400 text-sm block mb-1">Ngày gia hạn</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                    {formatDate(subscription.renewalDate)}
                  </span>
                </div>
              )}
            </div>

            {/* Quota Section - Lượt sử dụng */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Lượt sử dụng trong kỳ</h3>
                </div>
                <Button variant="secondary" onClick={() => navigate("/addon-packages")}>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Mua thêm lượt
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Lượt tạo đề */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-blue-700 dark:text-blue-300 font-medium">Lượt tạo đề còn lại</span>
                    <div className="w-10 h-10 bg-blue-200 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    {(() => {
                      const maxVal = usageStats.maxTestGenerations ?? 0;
                      const used = usageStats.usedTestGenerations ?? 0;
                      const addonRemaining = usageStats.addonTestGenerations ?? 0;
                      const addonPurchased = usageStats.addonPurchasedTestGenerations ?? 0;
                      
                      if (maxVal === -1) {
                        return (
                          <>
                            <span className="text-3xl font-bold text-blue-800 dark:text-blue-200">∞</span>
                            <span className="text-blue-600 dark:text-blue-400 text-sm mb-1">không giới hạn</span>
                          </>
                        );
                      }
                      
                      // Số còn lại = (max từ gói - đã dùng) + addon còn lại
                      const remainingFromSubscription = Math.max(0, maxVal - used);
                      const totalRemaining = remainingFromSubscription + addonRemaining;
                      // Tổng ban đầu = max từ gói + addon đã mua (không đổi)
                      const totalLimit = maxVal + addonPurchased;
                      
                      return (
                        <>
                          <span className="text-3xl font-bold text-blue-800 dark:text-blue-200">{totalRemaining}</span>
                          <span className="text-blue-600 dark:text-blue-400 text-sm mb-1">/ {totalLimit} lượt</span>
                        </>
                      );
                    })()}
                  </div>
                  {usageStats.addonPurchasedTestGenerations > 0 && (
                    <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                      <span className="text-sm text-blue-600 dark:text-blue-400">
                        Bao gồm <span className="font-semibold">{usageStats.addonPurchasedTestGenerations}</span> lượt từ gói mua thêm
                      </span>
                    </div>
                  )}
                </div>

                {/* Lượt kiểm duyệt */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-purple-700 dark:text-purple-300 font-medium">Lượt kiểm duyệt còn lại</span>
                    <div className="w-10 h-10 bg-purple-200 dark:bg-purple-800 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    {(() => {
                      const maxVal = usageStats.maxValidationRequests ?? 0;
                      const used = usageStats.usedValidationRequests ?? 0;
                      const addonRemaining = usageStats.addonValidationRequests ?? 0;
                      const addonPurchased = usageStats.addonPurchasedValidationRequests ?? 0;
                      
                      if (maxVal === -1) {
                        return (
                          <>
                            <span className="text-3xl font-bold text-purple-800 dark:text-purple-200">∞</span>
                            <span className="text-purple-600 dark:text-purple-400 text-sm mb-1">không giới hạn</span>
                          </>
                        );
                      }
                      
                      // Số còn lại = (max từ gói - đã dùng) + addon còn lại
                      const remainingFromSubscription = Math.max(0, maxVal - used);
                      const totalRemaining = remainingFromSubscription + addonRemaining;
                      // Tổng ban đầu = max từ gói + addon đã mua (không đổi)
                      const totalLimit = maxVal + addonPurchased;
                      
                      return (
                        <>
                          <span className="text-3xl font-bold text-purple-800 dark:text-purple-200">{totalRemaining}</span>
                          <span className="text-purple-600 dark:text-purple-400 text-sm mb-1">/ {totalLimit} lượt</span>
                        </>
                      );
                    })()}
                  </div>
                  {usageStats.addonPurchasedValidationRequests > 0 && (
                    <div className="mt-2 pt-2 border-t border-purple-200 dark:border-purple-700">
                      <span className="text-sm text-purple-600 dark:text-purple-400">
                        Bao gồm <span className="font-semibold">{usageStats.addonPurchasedValidationRequests}</span> lượt từ gói mua thêm
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Other Entitlements */}
              {subscription.entitlementsSnapshot && Object.keys(subscription.entitlementsSnapshot).filter(key => !["maxMonthlyTestGenerations", "maxValidationRequests"].includes(key)).length > 0 && (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Quyền lợi khác</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(subscription.entitlementsSnapshot)
                      .filter(([key]) => !["maxMonthlyTestGenerations", "maxValidationRequests"].includes(key))
                      .map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-start gap-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 border border-primary-200 dark:border-primary-800 hover:border-primary-500 dark:hover:border-primary-400 transition-colors"
                      >
                        <span className="text-primary-600 dark:text-primary-400 font-bold text-xl">✓</span>
                        <div className="flex-1">
                          <span className="text-gray-900 dark:text-gray-100 font-semibold block">{key}</span>
                          <span className="text-gray-700 dark:text-gray-300 text-sm">
                            {formatEntitlementValue(value)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex justify-end">
              <Button variant="danger" onClick={handleCancelSubscription} loading={cancelling}>
                Hủy gói đăng ký
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            © 2025 Learinal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default MySubscriptionPage;
