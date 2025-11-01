/**
 * Header Component
 * Main application header with navigation
 */

import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../constants/routes";
import "./Header.css";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = ROUTES.LOGIN;
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <Link to={ROUTES.HOME}>Learinal</Link>
        </div>

        <nav className="header-nav">
          {isAuthenticated ? (
            <>
              <Link to={ROUTES.DASHBOARD} className="nav-link">
                Dashboard
              </Link>
              <Link to={ROUTES.DOCUMENTS} className="nav-link">
                Tài liệu
              </Link>
              <Link to={ROUTES.SUBJECTS} className="nav-link">
                Môn học
              </Link>
              <Link to={ROUTES.QUIZ} className="nav-link">
                Quiz
              </Link>
              <div className="header-user">
                <span className="user-name">{user?.fullName}</span>
                <div className="user-dropdown">
                  <Link to={ROUTES.PROFILE} className="dropdown-item">
                    Hồ sơ
                  </Link>
                  <Link to={ROUTES.PROFILE_SETTINGS} className="dropdown-item">
                    Cài đặt
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item">
                    Đăng xuất
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to={ROUTES.LOGIN} className="nav-link">
                Đăng nhập
              </Link>
              <Link to={ROUTES.REGISTER} className="nav-link btn-primary">
                Đăng ký
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
