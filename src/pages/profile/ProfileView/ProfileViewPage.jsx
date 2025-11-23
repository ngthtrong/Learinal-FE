import { useAuth } from "../../../contexts/AuthContext";

function ProfileViewPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-medium p-8">
            <p className="text-center text-gray-500">Đang tải thông tin...</p>
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

  const getSubscriptionColor = (status) => {
    switch (status) {
      case "Active":
        return "text-green-600";
      case "Expired":
        return "text-red-600";
      case "Cancelled":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-medium p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Hồ sơ cá nhân</h1>

          {/* Avatar and Basic Info */}
          <div className="flex items-center mb-8">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-6">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{user.fullName}</h2>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center mt-2">
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
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Thông tin cá nhân</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm px-3 font-medium text-gray-700 mb-2">
                    Họ và tên
                  </label>
                  <p className="text-gray-900 px-3 rounded-md">{user.fullName}</p>
                </div>
                <div>
                  <label className="block text-sm px-3 font-medium text-gray-700 mb-2">Email</label>
                  <p className="text-gray-900 px-3 rounded-md">{user.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Information */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Thông tin gói đăng ký</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái gói đăng ký
                </label>
                <p
                  className={`text-gray-900 px-2 py-1 rounded-md ${getSubscriptionColor(
                    user.subscriptionStatus
                  )}`}
                >
                  {user.subscriptionStatus === "Active"
                    ? "Hoạt động"
                    : user.subscriptionStatus === "Expired"
                    ? "Hết hạn"
                    : user.subscriptionStatus === "Cancelled"
                    ? "Đã hủy"
                    : "Không có"}
                </p>
              </div>
              {user.subscriptionRenewalDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày gia hạn
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {new Date(user.subscriptionRenewalDate).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileViewPage;
