import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import HomeIcon from "@/components/icons/HomeIcon";
import QuizIcon from "@/components/icons/QuizIcon";
import GlobeIcon from "@/components/icons/GlobeIcon";
import SubjectsIcon from "@/components/icons/SubjectsIcon";

const SidebarLayout = ({ children }) => {
  const { user } = useAuth();
  const role = user?.role || "Learner";
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sidebar_collapsed") === "1";
    } catch {
      return false;
    }
  });
  const sideNavRef = useRef(null);
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
      label: "Home",
      to: "/home",
      icon: HomeIcon,
      roles: ["Learner", "Educator", "Admin"],
    },
    {
      key: "subjects",
      label: "Subjects",
      to: "/subjects",
      icon: SubjectsIcon,
      roles: ["Learner", "Educator", "Admin"],
    },
    {
      key: "quiz",
      label: "Quiz",
      to: "/quiz",
      icon: QuizIcon,
      roles: ["Learner", "Educator", "Admin"],
    },
    {
      key: "public",
      label: "Public",
      to: "/public",
      icon: GlobeIcon,
      roles: ["Learner", "Educator", "Admin"],
    },
  ];
  const visible = items.filter((it) => it.roles.includes(role));

  // Theme and logout controls have been moved to Topbar; keep theme state for logo only.

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        ref={sideNavRef}
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 overflow-y-auto ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <nav className="flex flex-col gap-1 p-3 pt-20">
          {visible.map((it) => {
            const Icon = it.icon;
            return (
              <NavLink
                key={it.key}
                to={it.to}
                title={it.label}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-primary-50 text-primary-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  } ${collapsed ? "justify-center" : ""}`
                }
              >
                <span className="text-xl" aria-hidden="true">
                  <Icon />
                </span>
                {!collapsed && <span className="text-sm font-medium">{it.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Floating collapse button */}
      <button
        className={`fixed top-24 bg-white border border-gray-300 rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-gray-100 transition-all z-50 ${
          collapsed ? "left-16" : "left-60"
        }`}
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
        title={collapsed ? "Mở rộng" : "Thu gọn"}
      >
        {collapsed ? "⟩" : "⟨"}
      </button>

      {/* Main content */}
      <main className={`flex-1 transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"} pt-16`}>
        {children}
      </main>
    </div>
  );
};

export default SidebarLayout;
