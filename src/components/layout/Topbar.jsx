import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import { APP_CONFIG } from "@/config/app.config";
import logoLight from "@/assets/images/logo/learinal-logo-light.png";
import logoDark from "@/assets/images/logo/learinal-logo-dark.png";
import "./Topbar.css";

const Topbar = ({ theme = "light" }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = user?.role || "Learner";
  const [menuOpen, setMenuOpen] = useState(false);
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

  const items = [
    { key: "home", label: "Home", to: "/home", roles: ["Learner", "Educator", "Admin"] },
    {
      key: "upload",
      label: "Upload",
      to: "/documents/upload",
      roles: ["Learner", "Educator", "Admin"],
    },
    { key: "quiz", label: "Quiz", to: "/quiz", roles: ["Learner", "Educator", "Admin"] },
    { key: "public", label: "Public", to: "/public", roles: ["Learner", "Educator", "Admin"] },
    // Educator/Reviewer-only example (wire up when page ready)
    {
      key: "review",
      label: "Review",
      to: "/admin/validation-requests",
      roles: ["Educator", "Admin"],
    },
    { key: "admin", label: "Admin", to: "/admin", roles: ["Admin"] },
  ];

  const visible = items.filter((it) => it.roles.includes(role));

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
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
            {it.label}
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
              <button
                className="tb-menu-item danger"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
