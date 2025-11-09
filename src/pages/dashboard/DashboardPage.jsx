/**
 * Dashboard Page
 * Main dashboard after login
 */

import React, { useEffect, useState } from "react";
import { useAuth } from "@contexts/AuthContext";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Simulate fetching dashboard stats
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStats({
        documents: 12,
        quizzes: 8,
        completedQuizzes: 5,
        avgScore: 85,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-600">Learinal</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Xin chào, {user?.fullName}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-linear-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 text-white shadow-large">
            <h2 className="text-3xl font-bold mb-2">Chào mừng trở lại! 👋</h2>
            <p className="text-lg opacity-90">
              Đây là dashboard của bạn. Hãy bắt đầu học tập ngay hôm nay!
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-medium hover:shadow-large transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                  📚
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">{stats?.documents || 0}</h3>
                  <p className="text-gray-600">Tài liệu</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-medium hover:shadow-large transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-2xl">
                  📝
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">{stats?.quizzes || 0}</h3>
                  <p className="text-gray-600">Bộ câu hỏi</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-medium hover:shadow-large transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl">
                  ✅
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {stats?.completedQuizzes || 0}
                  </h3>
                  <p className="text-gray-600">Hoàn thành</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-medium hover:shadow-large transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center text-2xl">
                  🎯
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">{stats?.avgScore || 0}%</h3>
                  <p className="text-gray-600">Điểm TB</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Info Section */}
          <div className="bg-white rounded-xl p-6 shadow-medium">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Thông tin tài khoản</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1">Email:</span>
                <span className="text-gray-900 font-medium">{user?.email}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1">Vai trò:</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-700 font-medium text-sm w-fit">
                  {user?.role}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 mb-1">Trạng thái:</span>
                {user?.isEmailVerified ? (
                  <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                    ✓ Đã xác thực
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                    ⚠ Chưa xác thực
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-medium">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Hành động nhanh</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-all">
                <span className="text-3xl">📤</span>
                <span className="text-sm font-medium text-gray-700">Upload tài liệu</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-all">
                <span className="text-3xl">❓</span>
                <span className="text-sm font-medium text-gray-700">Tạo câu hỏi</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-all">
                <span className="text-3xl">📊</span>
                <span className="text-sm font-medium text-gray-700">Xem thống kê</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-all">
                <span className="text-3xl">⚙️</span>
                <span className="text-sm font-medium text-gray-700">Cài đặt</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
