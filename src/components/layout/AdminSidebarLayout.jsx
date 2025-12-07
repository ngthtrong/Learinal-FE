import React, { useEffect, useRef, useState } from "react";
import { NavLink, Navigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import DashboardIcon from "@/components/icons/DashboardIcon";
import ChartIcon from "@/components/icons/ChartIcon";
import UsersIcon from "@/components/icons/UsersIcon";
import ShieldCheckIcon from "@/components/icons/ShieldCheckIcon";
import SubscriptionsIcon from "@/components/icons/SubscriptionsIcon";
import ManagePackagesIcon from "@/components/icons/ManagePackagesIcon";
import CoinsIcon from "@/components/icons/CoinsIcon";

/**
 * AdminSidebarLayout
 * Sidebar chuyên cho khu vực quản trị, chỉ hiển thị nếu role === Admin
 * Reuse phong cách từ SidebarLayout nhưng tối giản items.
 */
const AdminSidebarLayout = ({ children }) => {
  const { user } = useAuth();
  const role = user?.role;

  // Hooks luôn được gọi trước bất kỳ return nào để tuân thủ rules of hooks
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("admin_sidebar_collapsed") === "1";
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
        const next = Math.min(Math.max(0, side.scrollTop + dy), maxScroll);
        side.scrollTop = next;
      }
    };
    window.addEventListener("wheel", onWheelGlobal, { passive: false, capture: true });
    return () => window.removeEventListener("wheel", onWheelGlobal, { capture: true });
  }, []);

  const items = [
    { key: "admin_dashboard", label: "Tổng Quan", to: "/admin", icon: DashboardIcon },
    { key: "admin_users", label: "Người Dùng", to: "/admin/users", icon: UsersIcon },
    {
      key: "admin_subscription_purchases",
      label: "Quản Lý Gói Người Dùng",
      to: "/admin/subscription-purchases",
      icon: ManagePackagesIcon,
    },
    {
      key: "admin_plans",
      label: "Gói Nâng Cấp",
      to: "/admin/subscription-plans",
      icon: SubscriptionsIcon,
    },
    {
      key: "admin_addon_packages",
      label: "Gói Mua Thêm",
      to: "/admin/addon-packages",
      icon: SubscriptionsIcon,
    },
    {
      key: "admin_commission",
      label: "Hoa Hồng",
      to: "/admin/commission-records",
      icon: CoinsIcon,
    },
    {
      key: "admin_financials",
      label: "Thống Kê",
      to: "/admin/financials",
      icon: ChartIcon,
    },
    {
      key: "admin_content_flags",
      label: "Báo Cáo Nội Dung",
      to: "/admin/content-flags",
      icon: ({ size = 20, stroke = 2 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      ),
    },
  ];

  // Sau khi hooks đã chạy, mới kiểm tra role để quyết định render
  if (role !== "Admin") {
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
              end={it.to === "/admin"}
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
        className={`fixed top-24 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all z-50 text-gray-700 dark:text-gray-300 ${
          collapsed ? "left-16" : "left-60"
        } ${isHovered ? "opacity-100" : "opacity-0"}`}
        onClick={(e) => {
          e.stopPropagation();
          const next = !collapsed;
          setCollapsed(next);
          try {
            localStorage.setItem("admin_sidebar_collapsed", next ? "1" : "0");
          } catch {
            /* noop */
          }
        }}
        aria-label={collapsed ? "Expand admin sidebar" : "Collapse admin sidebar"}
        title={collapsed ? "Mở rộng" : "Thu gọn"}
      >
        {collapsed ? "⟩" : "⟨"}
      </button>

      <main
        className={`flex-1 transition-all duration-300 bg-gray-50 dark:bg-gray-950 ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        {children}
      </main>
    </div>
  );
};

export default AdminSidebarLayout;
