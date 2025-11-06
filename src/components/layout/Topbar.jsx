import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import { Modal } from "@/components/common";
import { APP_CONFIG } from "@/config/app.config";
import logoLight from "@/assets/images/logo/learinal-logo-light.png";
import logoDark from "@/assets/images/logo/learinal-logo-dark.png";
import "./Topbar.css";

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
    <header className="topbar card">
      <div className="tb-left">
        <img
          src={currentTheme === "dark" ? logoDark : logoLight}
          alt="Learinal"
          className="brand-logo"
          onClick={() => navigate("/home")}
          style={{ cursor: "pointer" }}
        />
        <div className="brand-title">
          <span className="brand-le">Lear</span>
          <span className="brand-inal">inal</span>
        </div>
      </div>
      <nav className="tb-nav">
        {visible.map((it) => (
          <NavLink
            key={it.key}
            to={it.to}
            className={({ isActive }) => "tb-btn" + (isActive ? " active" : "")}
          >
            {it.key === "upgrade" && (
              <svg
                className="tb-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                focusable="false"
              >
                {/* Wallet body */}
                <rect
                  x="3"
                  y="7"
                  width="18"
                  height="12"
                  rx="3"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                {/* Wallet flap */}
                <path
                  d="M3 9h10a3 3 0 0 0 3-3v0a2 2 0 0 0-2-2H6a3 3 0 0 0-3 3v2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                {/* Pocket/Payment notch */}
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
      <div className="tb-right">
        {/* Theme toggle: pill with sliding knob (no icons) */}
        <button
          className={"tb-theme-toggle" + (currentTheme === "dark" ? " is-dark" : "")}
          onClick={toggleTheme}
          aria-label="Toggle theme"
          role="switch"
          aria-checked={currentTheme === "dark"}
        >
          <span className="tb-toggle-track" />
          <span className="tb-toggle-knob" />
        </button>
        <div className="tb-user-wrap" ref={menuRef}>
          <button
            className="tb-user-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            {user?.fullName || user?.email}
          </button>
          {menuOpen && (
            <div className="tb-menu" role="menu">
              <button
                className="tb-menu-item"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/profile");
                }}
              >
                Trang cá nhân
              </button>
              <button
                className="tb-menu-item"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/profile/edit");
                }}
              >
                Cài đặt
              </button>
              <a className="tb-menu-item" role="menuitem" href="mailto:contact@learinalapp.page.gd">
                Liên hệ hỗ trợ
              </a>
              <div className="tb-menu-sep" />
              <button className="tb-menu-item danger" role="menuitem" onClick={openLogoutModal}>
                Đăng xuất
              </button>
            </div>
          )}
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
        <p>Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?</p>
        <p style={{ marginTop: "0.5rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
          Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng Learinal.
        </p>
      </Modal>
    </header>
  );
};

export default Topbar;
