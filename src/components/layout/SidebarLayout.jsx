import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import HomeIcon from "@/components/icons/HomeIcon";
import QuizIcon from "@/components/icons/QuizIcon";
import GlobeIcon from "@/components/icons/GlobeIcon";
import SubjectsIcon from "@/components/icons/SubjectsIcon";
import DocumentIcon from "@/components/icons/DocumentIcon";

const SidebarLayout = ({ children }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const role = user?.role || "Learner";
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sidebar_collapsed") === "1";
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
  // Global wheel routing using hit-test under pointer to avoid scroll latching issues
  useEffect(() => {
    const side = sideNavRef.current;
    if (!side) return;

    const onWheelGlobal = (e) => {
      const dy = e.deltaY;
      if (dy === 0) return;

      const node = document.elementFromPoint(e.clientX, e.clientY);
      const isInSidebar = node && (node === side || side.contains(node));

      if (isInSidebar) {
        // Consume and scroll sidebar only
        e.preventDefault();
        const maxScroll = side.scrollHeight - side.clientHeight;
        const next = Math.min(Math.max(0, side.scrollTop + dy), maxScroll);
        side.scrollTop = next;
      } else {
        // Let default page scroll happen
        // But if the event target is erroneously latched to sidebar, force page scroll
        // by preventing default and scrolling window manually
        const targetEl = e.target;
        if (targetEl && (targetEl === side || side.contains(targetEl))) {
          e.preventDefault();
          window.scrollBy({ top: dy, left: 0, behavior: "auto" });
        }
        // else: do nothing -> allow browser default page scroll
      }
    };

    // Capture phase to win over bubbling listeners
    window.addEventListener("wheel", onWheelGlobal, { passive: false, capture: true });
    return () => window.removeEventListener("wheel", onWheelGlobal, { capture: true });
  }, []);

  const items = [
    {
      key: "home",
      label: t('sidebar.home'),
      to: "/home",
      icon: HomeIcon,
      roles: ["Learner", "Expert", "Admin"],
    },
    {
      key: "subjects",
      label: t('sidebar.subjects'),
      to: "/subjects",
      icon: SubjectsIcon,
      roles: ["Learner", "Expert", "Admin"],
    },
    {
      key: "documents",
      label: t('sidebar.documents'),
      to: "/documents",
      icon: DocumentIcon,
      roles: ["Learner", "Expert", "Admin"],
    },
    {
      key: "quiz",
      label: t('sidebar.questionSets'),
      to: "/quiz",
      icon: QuizIcon,
      roles: ["Learner", "Expert", "Admin"],
    },
    {
      key: "public",
      label: t('sidebar.publicSets'),
      to: "/public",
      icon: GlobeIcon,
      roles: ["Learner", "Expert", "Admin"],
    },
  ];
  const visible = items.filter((it) => it.roles.includes(role));

  // Theme and logout controls have been moved to Topbar; keep theme state for logo only.

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Hidden on mobile */}
      <aside
        ref={sideNavRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden md:block fixed left-0 top-0 h-screen backdrop-blur-[10px] bg-white/70 dark:bg-slate-900/70 border-r border-white/30 dark:border-white/5 transition-all duration-300 z-40 overflow-y-auto ${
          collapsed ? "w-16 lg:w-20" : "w-56 lg:w-64"
        }`}
      >
        {/* Logo/Brand */}
        <div
          className={`flex items-center ${
            collapsed ? "justify-center" : "px-4 lg:px-6"
          } h-14 lg:h-16 border-b border-white/30 dark:border-white/5`}
        >
          {collapsed ? (
            <span className="text-xl lg:text-2xl font-bold text-primary-600 dark:text-primary-400">L</span>
          ) : (
            <span className="text-lg lg:text-xl font-bold text-primary-600 dark:text-primary-400">
              📚 Learinal
            </span>
          )}
        </div>

        <nav className="flex flex-col gap-1 p-2 lg:p-3 pt-3 lg:pt-4">
          {visible.map((it) => {
            const Icon = it.icon;
            return (
              <NavLink
                key={it.key}
                to={it.to}
                title={it.label}
                className={({ isActive }) =>
                  `flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400"
                  } ${collapsed ? "justify-center" : ""}`
                }
              >
                {Icon && <Icon size={18} className="flex-shrink-0 lg:w-5 lg:h-5" />}
                {!collapsed && <span className="text-xs lg:text-sm font-medium">{it.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Floating collapse button - only show when user is logged in and not on mobile */}
      {user && !isMobile && (
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
              localStorage.setItem("sidebar_collapsed", next ? "1" : "0");
            } catch {
              /* noop */
            }
          }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
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
          {visible.slice(0, 5).map((it) => {
            const Icon = it.icon;
            return (
              <NavLink
                key={it.key}
                to={it.to}
                title={it.label}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg transition-all min-w-0 flex-1 ${
                    isActive
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                  }`
                }
              >
                {Icon && <Icon size={20} className="flex-shrink-0" />}
                <span className="text-[10px] font-medium truncate max-w-full">{it.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default SidebarLayout;
