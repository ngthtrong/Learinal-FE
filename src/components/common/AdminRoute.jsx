/**
 * AdminRoute
 * Bảo vệ các route yêu cầu quyền Admin. Nếu người dùng không phải Admin chuyển hướng về /home.
 */
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import { useLanguage } from "@contexts/LanguageContext";

const AdminRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 text-lg">
        {t("components.adminRoute.loading")}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role;
  if (role !== "Admin") {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default AdminRoute;
