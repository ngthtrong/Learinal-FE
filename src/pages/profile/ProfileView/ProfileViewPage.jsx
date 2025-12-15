import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Footer } from "@/components/layout";
import subscriptionsService from "@/services/api/subscriptions.service";
import { usersService } from "@/services/api/users.service";
import commissionRecordsService from "@/services/api/commissionRecords.service";
import { Modal, useToast } from "@/components/common";

function ProfileViewPage() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const { t, language } = useLanguage();
  const [subscription, setSubscription] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  
  // Expert stats
  const [expertStats, setExpertStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  
  // Expert edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState(null); // 'expertise' or 'yearsOfExperience'
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  // Fetch expert stats when user is Expert
  useEffect(() => {
    if (user?.role === "Expert") {
      fetchExpertStats();
    }
  }, [user?.role]);

  const fetchSubscription = async () => {
    try {
      setLoadingSubscription(true);
      const response = await subscriptionsService.getMySubscription();
      console.log("Subscription response:", response);
      // Backend returns { status, data: { subscription } }
      setSubscription(response.data?.subscription || null);
    } catch (err) {
      console.error("Error fetching subscription:", err);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const fetchExpertStats = async () => {
    try {
      setLoadingStats(true);
      const response = await commissionRecordsService.summary();
      console.log("Expert stats response:", response);
      setExpertStats(response.data || response);
    } catch (err) {
      console.error("Error fetching expert stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Open edit modal for expert fields
  const handleOpenEditModal = (field) => {
    setEditField(field);
    setEditValue(user[field] || "");
    setShowEditModal(true);
  };

  // Save expert field
  const handleSaveField = async () => {
    if (!editField) return;
    
    try {
      setSaving(true);
      await usersService.updateProfile({ [editField]: editValue });
      toast.showSuccess(t("profile.updateSuccess"));
      setShowEditModal(false);
      // Refresh user data
      if (refreshUser) {
        await refreshUser();
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.showError(err?.response?.data?.message || t("profile.updateError"));
    } finally {
      setSaving(false);
    }
  };

  // Get field label for modal
  const getFieldLabel = (field) => {
    if (!field) return "";
    const labels = {
      expertise: t("profile.expertFields.expertise"),
      yearsOfExperience: t("profile.expertFields.yearsOfExperience"),
    };
    return labels[field] || field;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">{t("profile.loading")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
      case "PendingActivation":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30";
      case "Deactivated":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Admin":
        return "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30";
      case "Expert":
        return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30";
      case "Learner":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700";
    }
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
    const labels = {
      maxSubjects: t("profile.entitlements.maxSubjects"),
      maxMonthlyTestGenerations: t("profile.entitlements.maxMonthlyTestGenerations"),
      maxValidationRequests: t("profile.entitlements.maxValidationRequests"),
      maxDocumentsPerSubject: t("profile.entitlements.maxDocumentsPerSubject"),
      // maxTotalDocuments: "Tổng số tài liệu", // Removed - now unlimited
      priorityProcessing: t("profile.entitlements.priorityProcessing"),
      canShare: t("profile.entitlements.canShare"),
    };
    return labels[key] || key;
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
      return value ? t("profile.entitlements.yes") : t("profile.entitlements.no");
    }
    if (typeof value === "object" && value !== null) {
      if (typeof value === "boolean") {
        return value ? t("profile.entitlements.yes") : t("profile.entitlements.no");
      }
      return JSON.stringify(value);
    }
    if (value === -1) {
      return t("profile.entitlements.unlimited");
    }
    return value;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:to-gray-900">
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-6 sm:pb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-200 dark:border-gray-700 gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl lg:text-3xl font-bold shadow-lg">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{user.fullName}</h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">{user.email}</p>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                    user.role
                  )}`}
                >
                  {user.role === "Learner"
                    ? t("profile.roles.learner")
                    : user.role === "Expert"
                    ? t("profile.roles.expert")
                    : t("profile.roles.admin")}
                </span>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="mb-6 sm:mb-8 border-b border-gray-200 dark:border-gray-700 pb-6 sm:pb-8">
            <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 flex items-center gap-2 pb-3 sm:pb-4">
              {user.role === "Expert" ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600 dark:text-primary-400"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600 dark:text-primary-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              )}{" "}
              {user.role === "Expert" ? t("profile.sections.expertInfo") : t("profile.sections.personalInfo")}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("profile.fields.fullName")}</label>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{user.fullName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("profile.fields.email")}</label>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ">
                    {t("profile.fields.accountStatus")}
                  </label>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      user.status
                    )}`}
                  >
                    {user.status === "Active"
                      ? t("profile.accountStatus.active")
                      : user.status === "PendingActivation"
                      ? t("profile.accountStatus.pending")
                      : user.status === "Deactivated"
                      ? t("profile.accountStatus.deactivated")
                      : user.status}
                  </span>
                </div>
                {user.createdAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ">
                      {t("profile.fields.joinDate")}
                    </label>
                    <p className="text-gray-900 dark:text-gray-100 font-medium">
                      {new Date(user.createdAt).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US")}
                    </p>
                  </div>
                )}

                {/* Expert-specific fields */}
                {user.role === "Expert" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("profile.expertFields.expertise")}
                      </label>
                      {user.expertise ? (
                        <div className="flex items-center gap-2">
                          <p className="text-gray-900 dark:text-gray-100 font-medium">{user.expertise}</p>
                          <button
                            onClick={() => handleOpenEditModal("expertise")}
                            className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            title={t("profile.edit")}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenEditModal("expertise")}
                          className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                          </svg>
                          {t("profile.addExpertise")}
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("profile.expertFields.yearsOfExperience")}
                      </label>
                      {user.yearsOfExperience ? (
                        <div className="flex items-center gap-2">
                          <p className="text-gray-900 dark:text-gray-100 font-medium">{user.yearsOfExperience} {t("profile.years")}</p>
                          <button
                            onClick={() => handleOpenEditModal("yearsOfExperience")}
                            className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            title={t("profile.edit")}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenEditModal("yearsOfExperience")}
                          className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                          </svg>
                          {t("profile.addYearsOfExperience")}
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("profile.expertFields.rating")}
                      </label>
                      <p className="text-gray-900 dark:text-gray-100 font-bold text-lg flex items-center gap-1.5">
                        {user.rating ? (
                          <>
                            <span className="text-yellow-600 dark:text-yellow-400">{user.rating}/5</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                          </>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400 font-normal">{t("profile.noRating")}</span>
                        )}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Expert Statistics */}
              {user.role === "Expert" && (
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                    {t("profile.expertStats.title")}:
                  </h4>
                  {loadingStats ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 dark:border-primary-400"></div>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{t("profile.loadingStats")}</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">{t("profile.expertStats.totalValidations")}</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {expertStats?.totalValidations || expertStats?.count || 0}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">{t("profile.expertStats.totalPaid")}</p>
                        <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                          {new Intl.NumberFormat(language === "vi" ? "vi-VN" : "en-US", {
                            style: "currency",
                            currency: "VND",
                          }).format(expertStats?.totalPaid || expertStats?.totalEarned || 0)}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">{t("profile.expertStats.pendingCommission")}</p>
                        <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                          {new Intl.NumberFormat(language === "vi" ? "vi-VN" : "en-US", {
                            style: "currency",
                            currency: "VND",
                          }).format(expertStats?.pendingEarnings || expertStats?.totalPending || 0)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Subscription Information - Only for Learner */}
          {user.role === "Learner" && (
            <div>
              <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                {t("profile.subscription.title")}
              </h3>
              {loadingSubscription ? (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 sm:p-6 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-2"></div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{t("profile.subscription.loading")}</p>
                </div>
              ) : subscription ? (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ">
                        {t("profile.subscription.planName")}
                      </label>
                      <p className="text-gray-900 dark:text-gray-100 font-bold text-lg ">
                        {subscription.plan?.planName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ">
                        {t("profile.subscription.status")}
                      </label>
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          subscription.status === "Active"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                            : subscription.status === "Expired"
                            ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                            : subscription.status === "Cancelled"
                            ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                            : subscription.status === "PendingPayment"
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {subscription.status === "Active"
                          ? t("profile.subscription.statusActive")
                          : subscription.status === "Expired"
                          ? t("profile.subscription.statusExpired")
                          : subscription.status === "Cancelled"
                          ? t("profile.subscription.statusCancelled")
                          : subscription.status === "PendingPayment"
                          ? t("profile.subscription.statusPending")
                          : subscription.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("profile.subscription.startDate")}
                      </label>
                      <p className="text-gray-900 dark:text-gray-100 font-medium">
                        {new Date(subscription.startDate).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US")}
                      </p>
                    </div>
                    {subscription.endDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                          {t("profile.subscription.endDate")}
                        </label>
                        <p className="text-gray-900 dark:text-gray-100 font-medium">
                          {new Date(subscription.endDate).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US")}
                        </p>
                      </div>
                    )}
                    {subscription.renewalDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                          {t("profile.subscription.renewalDate")}
                        </label>
                        <p className="text-gray-900 dark:text-gray-100 font-medium">
                          {new Date(subscription.renewalDate).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US")}
                        </p>
                      </div>
                    )}
                    {subscription.plan?.billingCycle && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                          {t("profile.subscription.billingCycle")}
                        </label>
                        <p className="text-gray-900 dark:text-gray-100 font-medium">
                          {subscription.plan.billingCycle === "Monthly" ? t("profile.subscription.monthly") : t("profile.subscription.yearly")}
                        </p>
                      </div>
                    )}
                    {subscription.plan?.price !== undefined && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                          {t("profile.subscription.price")}
                        </label>
                        <p className="text-gray-900 dark:text-gray-100 font-bold text-lg text-primary-600">
                          {new Intl.NumberFormat(language === "vi" ? "vi-VN" : "en-US", {
                            style: "currency",
                            currency: "VND",
                          }).format(subscription.plan.price)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Entitlements */}
                  {subscription.entitlementsSnapshot &&
                    Object.keys(subscription.entitlementsSnapshot).length > 0 && (
                      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 flex items-center gap-2">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
                          {t("profile.entitlements.title")}:
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                          {getSortedEntitlements(subscription.entitlementsSnapshot).map(([key, value]) => (
                            <div key={key} className="flex items-start gap-2">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                              <span className="text-gray-700 dark:text-gray-300 text-sm">
                                <span className="font-medium">{formatEntitlementLabel(key)}:</span>{" "}
                                {formatEntitlementValue(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 dark:bg-primary-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-8 sm:h-8 text-primary-600 dark:text-primary-400"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium mb-1 sm:mb-2">{t("profile.subscription.noSubscription")}</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t("profile.subscription.noSubscriptionDesc")}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Expert Field Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={t("profile.modal.updateTitle", { field: getFieldLabel(editField) })}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {getFieldLabel(editField)}
            </label>
            {editField === "yearsOfExperience" ? (
              <input
                type="number"
                min="0"
                max="50"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder={t("profile.modal.yearsPlaceholder")}
              />
            ) : (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder={t("profile.modal.expertisePlaceholder")}
              />
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
              disabled={saving}
            >
              {t("profile.modal.cancel")}
            </button>
            <button
              onClick={handleSaveField}
              disabled={saving || !editValue}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {t("profile.modal.save")}
            </button>
          </div>
        </div>
      </Modal>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default ProfileViewPage;
