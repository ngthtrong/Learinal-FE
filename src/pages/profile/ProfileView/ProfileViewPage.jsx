import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Footer } from "@/components/layout";
import subscriptionsService from "@/services/api/subscriptions.service";

function ProfileViewPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

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

  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin...</p>
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
    "maxTotalDocuments",
  ];

  const formatEntitlementLabel = (key) => {
    const labels = {
      maxSubjects: "Số môn học",
      maxMonthlyTestGenerations: "Số lần tạo đề/tháng",
      maxValidationRequests: "Số yêu cầu kiểm duyệt",
      maxDocumentsPerSubject: "Số tài liệu/môn học",
      maxTotalDocuments: "Tổng số tài liệu",
      priorityProcessing: "Xử lý ưu tiên",
      canShare: "Cho phép chia sẻ",
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
      return value ? "Có" : "Không";
    }
    if (typeof value === "object" && value !== null) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:to-gray-900">
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start mb-8 pb-8 border-b border-gray-200 dark:border-gray-700 gap-4 sm:gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{user.fullName}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-3">{user.email}</p>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                    user.role
                  )}`}
                >
                  {user.role === "Learner"
                    ? "Học viên"
                    : user.role === "Expert"
                    ? "Chuyên gia"
                    : "Quản trị viên"}
                </span>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-8">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2 pb-4">
              {user.role === "Expert" ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600 dark:text-primary-400"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600 dark:text-primary-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              )}{" "}
              {user.role === "Expert" ? "Thông tin chuyên gia" : "Thông tin cá nhân"}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Họ và tên</label>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{user.fullName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ">
                    Trạng thái tài khoản
                  </label>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      user.status
                    )}`}
                  >
                    {user.status === "Active"
                      ? "Hoạt động"
                      : user.status === "PendingActivation"
                      ? "Chờ kích hoạt"
                      : user.status === "Deactivated"
                      ? "Đã vô hiệu hóa"
                      : user.status}
                  </span>
                </div>
                {user.createdAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ">
                      Ngày tham gia
                    </label>
                    <p className="text-gray-900 dark:text-gray-100 font-medium">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                )}

                {/* Expert-specific fields */}
                {user.role === "Expert" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Chuyên môn
                      </label>
                      <p className="text-gray-900 dark:text-gray-100 font-medium">
                        {user.expertise || "Chưa cập nhật"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Số năm kinh nghiệm
                      </label>
                      <p className="text-gray-900 dark:text-gray-100 font-medium">
                        {user.yearsOfExperience || "Chưa cập nhật"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tỷ lệ hoa hồng
                      </label>
                      <p className="text-gray-900 dark:text-gray-100 font-bold text-lg text-primary-600 dark:text-primary-400">
                        {user.commissionRate ? `${user.commissionRate}%` : "Chưa thiết lập"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Đánh giá
                      </label>
                      <p className="text-gray-900 dark:text-gray-100 font-bold text-lg flex items-center gap-1.5">
                        {user.rating ? (
                          <>
                            <span className="text-yellow-600 dark:text-yellow-400">{user.rating}/5</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                          </>
                        ) : (
                          "Chưa có"
                        )}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Expert Statistics */}
              {user.role === "Expert" && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600 dark:text-primary-400"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                    Thống kê:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tổng kiểm duyệt</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {user.totalValidations || 0}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tổng hoa hồng</p>
                      <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(user.totalEarned || 0)}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Hoa hồng chờ</p>
                      <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(user.pendingEarnings || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Subscription Information - Only for Learner */}
          {user.role === "Learner" && (
            <div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600 dark:text-primary-400"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                Thông tin gói đăng ký
              </h3>
              {loadingSubscription ? (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-2"></div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Đang tải thông tin gói đăng ký...</p>
                </div>
              ) : subscription ? (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ">
                        Tên gói
                      </label>
                      <p className="text-gray-900 dark:text-gray-100 font-bold text-lg ">
                        {subscription.plan?.planName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ">
                        Trạng thái
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
                          ? "Hoạt động"
                          : subscription.status === "Expired"
                          ? "Hết hạn"
                          : subscription.status === "Cancelled"
                          ? "Đã hủy"
                          : subscription.status === "PendingPayment"
                          ? "Chờ thanh toán"
                          : subscription.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ngày bắt đầu
                      </label>
                      <p className="text-gray-900 dark:text-gray-100 font-medium">
                        {new Date(subscription.startDate).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    {subscription.endDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                          Ngày kết thúc
                        </label>
                        <p className="text-gray-900 dark:text-gray-100 font-medium">
                          {new Date(subscription.endDate).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    )}
                    {subscription.renewalDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                          Ngày gia hạn
                        </label>
                        <p className="text-gray-900 dark:text-gray-100 font-medium">
                          {new Date(subscription.renewalDate).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    )}
                    {subscription.plan?.billingCycle && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                          Chu kỳ thanh toán
                        </label>
                        <p className="text-gray-900 dark:text-gray-100 font-medium">
                          {subscription.plan.billingCycle === "Monthly" ? "Hàng tháng" : "Hàng năm"}
                        </p>
                      </div>
                    )}
                    {subscription.plan?.price !== undefined && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                          Giá gói
                        </label>
                        <p className="text-gray-900 dark:text-gray-100 font-bold text-lg text-primary-600">
                          {new Intl.NumberFormat("vi-VN", {
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
                      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600 dark:text-primary-400"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
                          Quyền lợi của gói:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600 dark:text-primary-400"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">Chưa có gói đăng ký</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Bạn chưa đăng ký gói nào</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default ProfileViewPage;
