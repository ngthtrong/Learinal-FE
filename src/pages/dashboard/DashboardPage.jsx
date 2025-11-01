/**
 * Dashboard Page
 * Main dashboard after login
 */

import React, { useEffect, useState } from "react";
import { useAuth } from "@contexts/AuthContext";
import "./DashboardPage.css";

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
      <div className="dashboard-page">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Learinal</h1>
          <div className="header-actions">
            <span className="user-greeting">Xin chào, {user?.fullName}</span>
            <button onClick={handleLogout} className="btn-logout">
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="welcome-section">
            <h2>Chào mừng trở lại! 👋</h2>
            <p>Đây là dashboard của bạn. Hãy bắt đầu học tập ngay hôm nay!</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: "#dbeafe" }}>
                📚
              </div>
              <div className="stat-content">
                <h3>{stats?.documents || 0}</h3>
                <p>Tài liệu</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: "#fef3c7" }}>
                📝
              </div>
              <div className="stat-content">
                <h3>{stats?.quizzes || 0}</h3>
                <p>Bộ câu hỏi</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: "#d1fae5" }}>
                ✅
              </div>
              <div className="stat-content">
                <h3>{stats?.completedQuizzes || 0}</h3>
                <p>Hoàn thành</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: "#fce7f3" }}>
                🎯
              </div>
              <div className="stat-content">
                <h3>{stats?.avgScore || 0}%</h3>
                <p>Điểm TB</p>
              </div>
            </div>
          </div>

          <div className="user-info-section">
            <h3>Thông tin tài khoản</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{user?.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Vai trò:</span>
                <span className="info-value role-badge">{user?.role}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Trạng thái:</span>
                <span className="info-value">
                  {user?.isEmailVerified ? (
                    <span className="status-verified">✓ Đã xác thực</span>
                  ) : (
                    <span className="status-unverified">⚠ Chưa xác thực</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <h3>Hành động nhanh</h3>
            <div className="actions-grid">
              <button className="action-card">
                <span className="action-icon">📤</span>
                <span>Upload tài liệu</span>
              </button>
              <button className="action-card">
                <span className="action-icon">❓</span>
                <span>Tạo câu hỏi</span>
              </button>
              <button className="action-card">
                <span className="action-icon">📊</span>
                <span>Xem thống kê</span>
              </button>
              <button className="action-card">
                <span className="action-icon">⚙️</span>
                <span>Cài đặt</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
