/**
 * Dashboard Page
 * Main dashboard after login
 */

import React, { useEffect, useState } from "react";
import { useAuth } from "@contexts/AuthContext";
import { usersService } from "@/services/api";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await usersService.getDashboardStats();
      setStats(data);
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
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg px-6 py-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-gray-900">📊 Dashboard</h1>
              <p className="text-lg text-gray-600">Xin chào, {user?.fullName}! Chào mừng trở lại</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium shadow-sm"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-8 text-white shadow-sm">
            <h2 className="text-3xl font-bold mb-2">Chào mừng trở lại! 👋</h2>
            <p className="text-lg opacity-90">
              Đây là dashboard của bạn. Hãy bắt đầu học tập ngay hôm nay!
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
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

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
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

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
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

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
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
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
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
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Hành động nhanh</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-all">
                <span className="text-3xl">📤</span>
                <span className="text-sm font-medium text-gray-700">Upload tài liệu</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-all">
                <span className="text-3xl">❓</span>
                <span className="text-sm font-medium text-gray-700">Tạo câu hỏi</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-all">
                <span className="text-3xl">📊</span>
                <span className="text-sm font-medium text-gray-700">Xem thống kê</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-all">
                <span className="text-3xl">⚙️</span>
                <span className="text-sm font-medium text-gray-700">Cài đặt</span>
              </button>
            </div>
          </div>
        </div>
      </main>

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
};

export default DashboardPage;
