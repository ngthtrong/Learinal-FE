import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
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
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải thông tin...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "text-green-600 bg-green-100";
      case "PendingActivation":
        return "text-yellow-600 bg-yellow-100";
      case "Deactivated":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Admin":
        return "text-purple-600 bg-purple-100";
      case "Expert":
        return "text-blue-600 bg-blue-100";
      case "Learner":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
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
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50">
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Avatar and Basic Info */}
          <div className="flex items-center mb-8 pb-8 border-b border-gray-200">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mr-6 shadow-lg">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.fullName}</h2>
              <p className="text-gray-600 mb-3">{user.email}</p>
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
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>{user.role === "Expert" ? "👨‍🏫" : "📋"}</span>{" "}
              {user.role === "Expert" ? "Thông tin chuyên gia" : "Thông tin cá nhân"}
            </h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                  <p className="text-gray-900 font-medium">{user.fullName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <p className="text-gray-900 font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày tham gia
                    </label>
                    <p className="text-gray-900 font-medium">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                )}

                {/* Expert-specific fields */}
                {user.role === "Expert" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chuyên môn
                      </label>
                      <p className="text-gray-900 font-medium">
                        {user.expertise || "Chưa cập nhật"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số năm kinh nghiệm
                      </label>
                      <p className="text-gray-900 font-medium">
                        {user.yearsOfExperience || "Chưa cập nhật"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tỷ lệ hoa hồng
                      </label>
                      <p className="text-gray-900 font-bold text-lg text-primary-600">
                        {user.commissionRate ? `${user.commissionRate}%` : "Chưa thiết lập"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Đánh giá
                      </label>
                      <p className="text-gray-900 font-bold text-lg text-yellow-600">
                        {user.rating ? `${user.rating}/5 ⭐` : "Chưa có"}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Expert Statistics */}
              {user.role === "Expert" && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4">📊 Thống kê:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Tổng kiểm duyệt</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {user.totalValidations || 0}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Tổng hoa hồng</p>
                      <p className="text-2xl font-bold text-primary-600">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(user.totalEarned || 0)}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Hoa hồng chờ</p>
                      <p className="text-2xl font-bold text-amber-600">
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
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>💳</span> Thông tin gói đăng ký
              </h3>
              {loadingSubscription ? (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Đang tải thông tin gói đăng ký...</p>
                </div>
              ) : subscription ? (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên gói
                      </label>
                      <p className="text-gray-900 font-bold text-lg">
                        {subscription.plan?.planName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trạng thái
                      </label>
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${
                          subscription.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : subscription.status === "Expired"
                            ? "bg-red-100 text-red-700"
                            : subscription.status === "Cancelled"
                            ? "bg-orange-100 text-orange-700"
                            : subscription.status === "PendingPayment"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày bắt đầu
                      </label>
                      <p className="text-gray-900 font-medium">
                        {new Date(subscription.startDate).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    {subscription.endDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ngày kết thúc
                        </label>
                        <p className="text-gray-900 font-medium">
                          {new Date(subscription.endDate).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    )}
                    {subscription.renewalDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ngày gia hạn
                        </label>
                        <p className="text-gray-900 font-medium">
                          {new Date(subscription.renewalDate).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    )}
                    {subscription.plan?.billingCycle && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Chu kỳ thanh toán
                        </label>
                        <p className="text-gray-900 font-medium">
                          {subscription.plan.billingCycle === "Monthly" ? "Hàng tháng" : "Hàng năm"}
                        </p>
                      </div>
                    )}
                    {subscription.plan?.price !== undefined && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Giá gói
                        </label>
                        <p className="text-gray-900 font-bold text-lg text-primary-600">
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
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="font-bold text-gray-900 mb-4">✨ Quyền lợi của gói:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(subscription.entitlementsSnapshot).map(([key, value]) => (
                            <div key={key} className="flex items-start gap-2">
                              <span className="text-primary-600 font-bold text-lg flex-shrink-0">
                                ✓
                              </span>
                              <span className="text-gray-700 text-sm">
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
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="text-4xl mb-3">📦</div>
                  <p className="text-gray-600 font-medium mb-2">Chưa có gói đăng ký</p>
                  <p className="text-gray-500 text-sm">Bạn chưa đăng ký gói nào</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 text-sm">© 2025 Learinal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default ProfileViewPage;
