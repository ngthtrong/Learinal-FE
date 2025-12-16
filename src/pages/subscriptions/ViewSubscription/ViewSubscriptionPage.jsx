/**
 * View Subscription Page
 * Display all subscription plans for Admin
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import subscriptionsService from "@/services/api/subscriptions.service";
import Button from "@/components/common/Button";
import { useLanguage } from "@/contexts/LanguageContext";

function ViewSubscriptionPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
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

  // Định nghĩa thứ tự hiển thị cố định cho entitlements
  const ENTITLEMENT_ORDER = [
    "maxMonthlyTestGenerations",
    "maxValidationRequests",
    "priorityProcessing",
    "canShare",
    "maxSubjects",
    "maxDocumentsPerSubject",
    // "maxTotalDocuments", // Removed - now unlimited
  ];

  const formatEntitlementLabel = (key) => {
    const labelKey = `subscription.entitlementLabels.${key}`;
    const translated = t(labelKey);
    return translated !== labelKey ? translated : key;
  };

  // Hàm sắp xếp entitlements theo thứ tự cố định
  const getSortedEntitlements = (entitlements) => {
    if (!entitlements) return [];
    return ENTITLEMENT_ORDER
      .filter(key => key in entitlements)
      .map(key => [key, entitlements[key]]);
  };

  const formatEntitlementValue = (value) => {
    if (typeof value === "boolean") {
      return value ? t("common.yes") : t("common.no");
    }
    if (typeof value === "object" && value !== null) {
      if (typeof value === "boolean") {
        return value ? t("common.yes") : t("common.no");
      }
      return JSON.stringify(value);
    }
    if (value === -1) {
      return t("subscription.mySubscription.unlimited");
    }
    return value;
  };

  const getPlanIcon = (planName) => {
    const name = planName.toLowerCase();
    if (name.includes("free")) return (
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-xl sm:rounded-2xl"></div>
        <div className="absolute inset-0.5 sm:inset-1 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      </div>
    );
    if (name.includes("basic")) return (
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl sm:rounded-2xl"></div>
        <div className="absolute inset-0.5 sm:inset-1 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
      </div>
    );
    if (name.includes("pro")) return (
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl sm:rounded-2xl shadow-lg"></div>
        <div className="absolute inset-0.5 sm:inset-1 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>
    );
    if (name.includes("premium")) return (
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl sm:rounded-2xl shadow-xl"></div>
        <div className="absolute inset-0.5 sm:inset-1 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      </div>
    );
    return (
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl sm:rounded-2xl"></div>
        <div className="absolute inset-0.5 sm:inset-1 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">{t("subscription.viewPlans.loading")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-lg max-w-2xl mx-auto mt-8">
            <p className="font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Sắp xếp plans theo giá tăng dần (trái qua phải)
  const sortedPlans = [...plans].sort((a, b) => a.price - b.price);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 rounded-lg px-4 sm:px-6 py-4 sm:py-6 mb-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">{t("subscription.viewPlans.pageTitle")}</h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
              {t("subscription.viewPlans.pageSubtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pb-6 sm:pb-8">
        {sortedPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mb-4 sm:mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-700 rounded-2xl sm:rounded-3xl"></div>
              <div className="absolute inset-1.5 sm:inset-2 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t("subscription.viewPlans.noPlans")}</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center">{t("subscription.viewPlans.noPlansDesc")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 pt-4">
            {sortedPlans.map((plan) => {
              const isPro = plan.planName.toLowerCase().includes("pro");
              return (
                <div
                  key={plan.id || plan._id}
                  className={`group relative rounded-xl sm:rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 ${
                    isPro 
                      ? "p-[2px] bg-gray-200 dark:bg-slate-700 hover:bg-gradient-to-r hover:from-primary-600 hover:to-secondary-600" 
                      : "border-2 border-gray-200 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-600 bg-white dark:bg-slate-800"
                  }`}
                >
                  {isPro && (
                    <div className="absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-2 sm:px-4 py-0.5 sm:py-1.5 rounded-full text-[10px] sm:text-sm font-bold shadow-md whitespace-nowrap">
                        {t("subscription.viewPlans.mostPopular")}
                      </span>
                    </div>
                  )}

                  <div className="pointer-events-none absolute -top-6 -right-6 w-24 sm:w-32 h-24 sm:h-32 bg-primary-200/30 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity" />

                  <div className={`relative p-4 sm:p-6 lg:p-8 ${isPro ? "bg-white dark:bg-slate-800 rounded-[10px] sm:rounded-[14px]" : ""}`}>
                    <div className="text-center mb-4 sm:mb-6">
                      <div className="flex justify-center mb-3 sm:mb-4">{getPlanIcon(plan.planName)}</div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">{plan.planName}</h3>
                      <div className="flex items-baseline justify-center gap-0.5 sm:gap-1">
                        <span className={`text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold ${isPro ? "bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent" : "text-primary-600 dark:text-primary-400"}`}>
                          {formatPrice(plan.price)}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg">
                          /{plan.billingCycle === "Monthly" ? t("subscription.viewPlans.month") : t("subscription.viewPlans.year")}
                        </span>
                      </div>
                    </div>

                    {plan.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-center mb-4 sm:mb-6 min-h-[2rem] sm:min-h-[3rem] text-xs sm:text-sm lg:text-base">
                        {plan.description}
                      </p>
                    )}

                    {plan.entitlements && (
                      <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-center mb-2 sm:mb-4 text-sm sm:text-base">
                          {t("subscription.viewPlans.entitlements")}
                        </h4>
                        <ul className="space-y-1.5 sm:space-y-2.5">
                          {getSortedEntitlements(plan.entitlements).map(([key, value]) => (
                            <li key={key} className="flex items-start gap-1.5 sm:gap-2.5">
                              <span className={`font-bold text-base sm:text-lg flex-shrink-0 ${isPro ? "bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent" : "text-primary-600 dark:text-primary-400"}`}>
                                ✓
                              </span>
                              <span className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">
                                <span className="font-medium">{formatEntitlementLabel(key)}:</span>{" "}
                                {formatEntitlementValue(value)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{t("subscription.status.label")}</span>
                        <span
                          className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                            plan.status === "Active"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400"
                          }`}
                        >
                          {plan.status === "Active" ? t("subscription.viewPlans.active") : t("subscription.viewPlans.inactive")}
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
    </div>
  );
}

export default ViewSubscriptionPage;
