import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import { Modal } from "@/components/common";
import { APP_CONFIG } from "@/config/app.config";
import logoLight from "@/assets/images/logo/learinal-logo-light.png";
import logoDark from "@/assets/images/logo/learinal-logo-dark.png";

const Topbar = ({ theme = "light" }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = user?.role || "Learner";
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef(null);
  const [currentTheme, setCurrentTheme] = useState(() => {
    try {
      const key = APP_CONFIG.STORAGE_KEYS.THEME;
      const fromDom = document.documentElement.getAttribute("data-theme");
      return (fromDom || localStorage.getItem(key) || theme || "light").toLowerCase();
    } catch {
      return theme || "light";
    }
  });

  // Only keep a single Upgrade entry in the topbar nav
  const items = [
    {
      key: "upgrade",
      label: "Upgrade",
      to: "/mysubscription",
      roles: ["Learner", "Educator", "Admin"],
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

  // Toggle dark/light mode: persist to localStorage and update <html data-theme>
  const toggleTheme = () => {
    try {
      const key = APP_CONFIG.STORAGE_KEYS.THEME;
      const current = (
        localStorage.getItem(key) ||
        document.documentElement.getAttribute("data-theme") ||
        "light"
      ).toLowerCase();
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem(key, next);
      // Update document root
      document.documentElement.setAttribute("data-theme", next);
      setCurrentTheme(next);
    } catch {
      void 0;
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

  // Observe data-theme attribute changes to keep logo/theme state in sync if changed elsewhere
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      const val = root.getAttribute("data-theme");
      if (val) setCurrentTheme(val.toLowerCase());
    };
    update();
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "data-theme") {
          update();
        }
      }
    });
    mo.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        {/* Left: Logo & Brand */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => navigate(role === "Admin" ? "/admin" : "/home")}
          title={role === "Admin" ? "Về trang quản trị" : "Về trang chính"}
          aria-label="Đi tới trang chính"
          role="link"
        >
          <img
            src={currentTheme === "dark" ? logoDark : logoLight}
            alt="Learinal"
            className="h-10 w-auto"
          />
          <div className="text-xl font-bold">
            <span className="text-primary-600">Lear</span>
            <span className="text-gray-800">inal</span>
          </div>
        </div>

        {/* Center: Navigation */}
        <nav className="flex items-center gap-2">
          {visible.map((it) => (
            <NavLink
              key={it.key}
              to={it.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
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

        {/* Right: Theme Toggle & User Menu */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            className={`relative w-12 h-6 rounded-full transition-colors ${
              currentTheme === "dark" ? "bg-primary-600" : "bg-gray-300"
            }`}
            onClick={toggleTheme}
            aria-label="Toggle theme"
            role="switch"
            aria-checked={currentTheme === "dark"}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                currentTheme === "dark" ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-800 transition-colors"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              {user?.fullName || user?.email}
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-large border border-gray-200 py-2 z-50">
                <button
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                >
                  Trang cá nhân
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile/edit");
                  }}
                >
                  Cài đặt
                </button>
                <a
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  role="menuitem"
                  href="mailto:contact@learinalapp.page.gd"
                >
                  Liên hệ hỗ trợ
                </a>
                <div className="border-t border-gray-200 my-2" />
                <button
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
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
      >
        <p className="text-gray-700">Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?</p>
        <p className="mt-2 text-sm text-gray-500">
          Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng Learinal.
        </p>
      </Modal>
    </header>
  );
};

export default Topbar;
