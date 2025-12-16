/**
 * Protected Route Component
 * Wraps routes that require authentication
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import { useLanguage } from "@contexts/LanguageContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontSize: "1.25rem",
          color: "#6b7280",
        }}
      >
        {t("components.protectedRoute.loading")}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
