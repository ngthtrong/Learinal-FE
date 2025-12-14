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
  const [isMobile, setIsMobile] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const sideNavRef = useRef(null);
  const moreMenuRef = useRef(null);

  // Check if mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setMoreMenuOpen(false);
      }
    };
    if (moreMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [moreMenuOpen]);

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
      key: "admin_bank_accounts",
      label: "Tài Khoản NH",
      to: "/admin/bank-accounts",
      icon: ({ size = 20, stroke = 2 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
          <path d="M7 15h0M2 9.5h20"></path>
        </svg>
      ),
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
              end={it.to === "/admin"}
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
          className={`hidden md:flex fixed top-24 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full w-7 h-7 lg:w-8 lg:h-8 items-center justify-center shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all z-50 text-gray-700 dark:text-gray-300 text-sm lg:text-base ${
            collapsed ? "left-14 lg:left-16" : "left-52 lg:left-60"
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
        <div className="flex items-center justify-around h-14 px-1">
          {items.slice(0, 4).map((it) => {
            const Icon = it.icon;
            return (
              <NavLink
                key={it.key}
                to={it.to}
                end={it.to === "/admin"}
                title={it.label}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 px-1.5 py-1.5 rounded-lg transition-all min-w-0 flex-1 ${
                    isActive
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                  }`
                }
              >
                <Icon size={20} stroke={2} className="flex-shrink-0" />
                <span className="text-[9px] font-medium truncate max-w-full leading-tight">{it.label}</span>
              </NavLink>
            );
          })}
          {/* More menu for remaining items */}
          {items.length > 4 && (
            <div ref={moreMenuRef} className="relative flex flex-col items-center justify-center gap-0.5 px-1.5 py-1.5 rounded-lg transition-all min-w-0 flex-1">
              <button 
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`flex flex-col items-center gap-0.5 ${
                  moreMenuOpen 
                    ? "text-primary-600 dark:text-primary-400" 
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
                <span className="text-[9px] font-medium">Thêm</span>
              </button>
              
              {/* Popup Menu */}
              {moreMenuOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
                  {items.slice(4).map((it) => {
                    const Icon = it.icon;
                    return (
                      <NavLink
                        key={it.key}
                        to={it.to}
                        onClick={() => setMoreMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 transition-all ${
                            isActive
                              ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`
                        }
                      >
                        <Icon size={18} stroke={2} className="flex-shrink-0" />
                        <span className="text-sm font-medium">{it.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default AdminSidebarLayout;
