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
    { key: "expert_commission", label: "Hoa hồng", to: "/expert/commission-records", icon: CoinsIcon },
    { key: "expert_validations", label: "Kiểm duyệt", to: "/expert/validation-requests", icon: ShieldCheckIcon },
  ];

  if (role !== "Expert") {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <aside
        ref={sideNavRef}
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 overflow-y-auto ${
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
                    ? "bg-primary-50 text-primary-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
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
        className={`fixed top-24 bg-white border border-gray-300 rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-gray-100 transition-all z-50 ${
          collapsed ? "left-16" : "left-60"
        }`}
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

      <main className={`flex-1 transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"} pt-16`}>
        {children}
      </main>
    </div>
  );
};

export default ExpertSidebarLayout;