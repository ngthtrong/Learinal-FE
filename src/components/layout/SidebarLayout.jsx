import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import "./Sidebar.css";
import HomeIcon from "@/components/icons/HomeIcon";
import UploadIcon from "@/components/icons/UploadIcon";
import QuizIcon from "@/components/icons/QuizIcon";
import GlobeIcon from "@/components/icons/GlobeIcon";

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
      key: "upload",
      label: "Upload",
      to: "/documents/upload",
      icon: UploadIcon,
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
    <div className={"app-with-sidebar" + (collapsed ? " is-collapsed" : "")}>
      <aside className="side-nav card" ref={sideNavRef}>
        <nav className="side-links">
          {visible.map((it) => {
            const Icon = it.icon;
            return (
              <NavLink
                key={it.key}
                to={it.to}
                title={it.label}
                className={({ isActive }) => "side-link" + (isActive ? " active" : "")}
              >
                <span className="link-icon" aria-hidden="true">
                  <Icon />
                </span>
                <span className="link-label">{it.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
      {/* Floating collapse button rendered OUTSIDE sidebar to bypass its stacking context */}
      <button
        className="side-collapse-fab"
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
      <main className="app-content">{children}</main>
    </div>
  );
};

export default SidebarLayout;
