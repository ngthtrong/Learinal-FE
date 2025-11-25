import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Modal, ThemeToggle } from "@/components/common";
import { APP_CONFIG } from "@/config/app.config";
import logoLight from "@/assets/images/logo/learinal-logo-light.png";
import logoDark from "@/assets/images/logo/learinal-logo-dark.png";

const Topbar = ({ theme: themeProp = "light" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const role = user?.role || "Learner";
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchOnScroll, setShowSearchOnScroll] = useState(false);
  const menuRef = useRef(null);

  // Only keep a single Upgrade entry in the topbar nav
  const items = [
    {
      key: "upgrade",
      label: "Nâng cấp",
      to: role === "Admin" ? "/subscriptions/view" : "/mysubscription",
      roles: ["Learner", "Admin"],
    },
  ];

  const visible = items.filter((it) => it.roles.includes(role));

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      setShowLogoutModal(false);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  const openLogoutModal = () => {
    setMenuOpen(false);
    setShowLogoutModal(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/home?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Close menu on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [menuOpen]);

  // Handle scroll to show search bar on home page when scrolled down
  useEffect(() => {
    if (location.pathname !== "/home") {
      setShowSearchOnScroll(false);
      return;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Show search bar when scrolled down past 200px (adjust as needed)
      setShowSearchOnScroll(scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        {/* Left: Logo & Brand */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => {
            if (role === "Admin") navigate("/admin");
            else if (role === "Expert") navigate("/expert");
            else navigate("/home");
          }}
          title={
            role === "Admin"
              ? "Về trang quản trị"
              : role === "Expert"
              ? "Về trang chuyên gia"
              : "Về trang chính"
          }
          aria-label="Đi tới trang chính"
          role="link"
        >
          <img
            src={theme === "dark" ? logoDark : logoLight}
            alt="Learinal"
            className="h-10 w-auto"
          />
          <div className="text-xl font-bold">
            <span className="text-primary-600">Lear</span>
            <span className="text-gray-800 dark:text-gray-200">inal</span>
          </div>
        </div>
        {/* Search Bar - Show when not on home page, or on home page when scrolled down, and only for Learners */}
        {(location.pathname !== "/home" || showSearchOnScroll) && role === "Learner" && (
          <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 mx-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Tìm môn học, bộ đề..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 pl-10 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M20 20l-3.5-3.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-sm font-medium transition-colors"
              aria-label="Tìm kiếm"
            >
              Tìm
            </button>
          </form>
        )}
        {/* Right: Navigation, Theme Toggle & User Menu */}
        <div className="flex items-center gap-4 ">
          {/* Navigation */}
          <nav className={`flex items-center gap-2 `}>
            {visible.map((it) => (
              <NavLink
                key={it.key}
                to={it.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? "bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                  }`
                }
              >
                {it.key === "upgrade" && (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <rect
                      x="3"
                      y="7"
                      width="18"
                      height="12"
                      rx="3"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M3 9h10a3 3 0 0 0 3-3v0a2 2 0 0 0-2-2H6a3 3 0 0 0-3 3v2z"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path
                      d="M17 12h4v6h-4a3 3 0 1 1 0-6z"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                    <circle cx="18.5" cy="15" r="1" fill="currentColor" />
                  </svg>
                )}
                <span>{it.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium text-gray-800 dark:text-gray-200 transition-colors"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              {user?.fullName || user?.email}
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-large border border-gray-200 dark:border-gray-700 py-2 z-50">
                {role !== "Admin" && (
                  <>
                    <button
                      className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/profile");
                      }}
                    >
                      Trang cá nhân
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/profile/edit");
                      }}
                    >
                      Cài đặt
                    </button>
                    <a
                      className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      role="menuitem"
                      href="mailto:contact@learinalapp.page.gd"
                    >
                      Liên hệ hỗ trợ
                    </a>
                    <div className="border-t border-gray-200 my-2" />
                  </>
                )}
                <button
                  className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  role="menuitem"
                  onClick={openLogoutModal}
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Xác nhận đăng xuất"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        onConfirm={handleLogout}
        variant="danger"
        loading={loggingOut}
        showCloseButton={false}
      >
        <p className="text-gray-700 dark:text-gray-300">
          Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng Learinal.
        </p>
      </Modal>
    </header>
  );
};

export default Topbar;
