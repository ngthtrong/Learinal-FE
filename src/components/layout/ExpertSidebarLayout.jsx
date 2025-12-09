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
  const [isMobile, setIsMobile] = useState(false);
  const sideNavRef = useRef(null);

  // Check if mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
      key: "expert_question_sets",
      label: "Bộ đề của tôi",
      to: "/expert/question-sets",
      icon: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
      ),
    },
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
      {/* Sidebar - Hidden on mobile */}
      <aside
        ref={sideNavRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden md:block fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 overflow-y-auto ${
          collapsed ? "w-16 lg:w-20" : "w-56 lg:w-64"
        }`}
      >
        <nav className="flex flex-col gap-1 pt-16 lg:pt-20 p-2 lg:p-3">
          {items.map((it) => (
            <NavLink
              key={it.key}
              to={it.to}
              end={it.to === "/expert"}
              title={it.label}
              className={({ isActive }) =>
                `flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                } ${collapsed ? "justify-center" : ""}`
              }
            >
              <span className="text-base lg:text-lg" aria-hidden="true">
                {(() => {
                  const Icon = it.icon;
                  return <Icon size={18} stroke={2} className="lg:w-5 lg:h-5" />;
                })()}
              </span>
              {!collapsed && <span className="text-xs lg:text-sm font-medium">{it.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Collapse button - Hidden on mobile */}
      {!isMobile && (
        <button
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`hidden md:flex fixed top-24 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full w-7 h-7 lg:w-8 lg:h-8 items-center justify-center shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all z-40 text-gray-700 dark:text-gray-300 text-sm lg:text-base ${
            collapsed ? "left-14 lg:left-16" : "left-52 lg:left-60"
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
      )}

      {/* Main content */}
      <main
        className={`flex-1 transition-all duration-300 bg-gray-50 dark:bg-gray-950 pb-16 md:pb-0 ${
          collapsed ? "md:ml-16 lg:ml-20" : "md:ml-56 lg:ml-64"
        }`}
      >
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50 safe-area-bottom">
        <div className="flex items-center justify-around h-14 px-2">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <NavLink
                key={it.key}
                to={it.to}
                end={it.to === "/expert"}
                title={it.label}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg transition-all min-w-0 flex-1 ${
                    isActive
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                  }`
                }
              >
                <Icon size={20} stroke={2} className="flex-shrink-0" />
                <span className="text-[10px] font-medium truncate max-w-full">{it.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default ExpertSidebarLayout;
