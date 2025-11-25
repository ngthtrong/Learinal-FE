import React, { useEffect, useRef, useState } from "react";
import { NavLink, Navigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import DashboardIcon from "@/components/icons/DashboardIcon";
import CoinsIcon from "@/components/icons/CoinsIcon";
import ShieldCheckIcon from "@/components/icons/ShieldCheckIcon";

/**
 * ExpertSidebarLayout
 * Sidebar dành cho chuyên gia (Expert): Dashboard, Hoa hồng, Yêu cầu kiểm duyệt
 */
const ExpertSidebarLayout = ({ children }) => {
  const { user } = useAuth();
  const role = user?.role;

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("expert_sidebar_collapsed") === "1";
    } catch {
      return false;
    }
  });
  const [isHovered, setIsHovered] = useState(false);
  const sideNavRef = useRef(null);

  useEffect(() => {
    const side = sideNavRef.current;
    if (!side) return;
    const onWheelGlobal = (e) => {
      const dy = e.deltaY;
      if (dy === 0) return;
      const node = document.elementFromPoint(e.clientX, e.clientY);
      const isInSidebar = node && (node === side || side.contains(node));
      if (isInSidebar) {
        e.preventDefault();
        const maxScroll = side.scrollHeight - side.clientHeight;
        side.scrollTop = Math.min(Math.max(0, side.scrollTop + dy), maxScroll);
      }
    };
    window.addEventListener("wheel", onWheelGlobal, { passive: false, capture: true });
    return () => window.removeEventListener("wheel", onWheelGlobal, { capture: true });
  }, []);

  const items = [
    { key: "expert_dashboard", label: "Tổng quan", to: "/expert", icon: DashboardIcon },
    {
      key: "expert_commission",
      label: "Hoa hồng",
      to: "/expert/commission-records",
      icon: CoinsIcon,
    },
    {
      key: "expert_validations",
      label: "Kiểm duyệt",
      to: "/expert/validation-requests",
      icon: ShieldCheckIcon,
    },
  ];

  if (role !== "Expert") {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <aside
        ref={sideNavRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 overflow-y-auto ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <nav className="flex flex-col gap-1 pt-20 p-3">
          {items.map((it) => (
            <NavLink
              key={it.key}
              to={it.to}
              end={it.to === "/expert"}
              title={it.label}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                } ${collapsed ? "justify-center" : ""}`
              }
            >
              <span className="text-lg" aria-hidden="true">
                {(() => {
                  const Icon = it.icon;
                  return <Icon size={20} stroke={2} />;
                })()}
              </span>
              {!collapsed && <span className="text-sm font-medium">{it.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      <button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-24 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all z-40 text-gray-700 dark:text-gray-300 ${
          collapsed ? "left-16" : "left-60"
        } ${isHovered ? "opacity-100" : "opacity-0"}`}
        onClick={(e) => {
          e.stopPropagation();
          const next = !collapsed;
          setCollapsed(next);
          try {
            localStorage.setItem("expert_sidebar_collapsed", next ? "1" : "0");
          } catch {
            /* noop */
          }
        }}
        aria-label={collapsed ? "Expand expert sidebar" : "Collapse expert sidebar"}
        title={collapsed ? "Mở rộng" : "Thu gọn"}
      >
        {collapsed ? "⟩" : "⟨"}
      </button>

      <main
        className={`flex-1 transition-all duration-300 bg-gray-50 dark:bg-gray-950 ${
          collapsed ? "ml-20" : "ml-64"
        } pt-16`}
      >
        {children}
      </main>
    </div>
  );
};

export default ExpertSidebarLayout;
