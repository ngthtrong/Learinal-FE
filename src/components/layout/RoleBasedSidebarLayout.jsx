import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import SidebarLayout from "./SidebarLayout";
import AdminSidebarLayout from "./AdminSidebarLayout";
import ExpertSidebarLayout from "./ExpertSidebarLayout";

/**
 * RoleBasedSidebarLayout
 * Renders the appropriate sidebar layout based on the user's role
 * - Admin: AdminSidebarLayout
 * - Expert: ExpertSidebarLayout
 * - Learner: SidebarLayout (default)
 */
const RoleBasedSidebarLayout = ({ children }) => {
  const { user } = useAuth();
  const role = user?.role;

  if (role === "Admin") {
    return <AdminSidebarLayout>{children}</AdminSidebarLayout>;
  }

  if (role === "Expert") {
    return <ExpertSidebarLayout>{children}</ExpertSidebarLayout>;
  }

  // Default to Learner sidebar
  return <SidebarLayout>{children}</SidebarLayout>;
};

export default RoleBasedSidebarLayout;
