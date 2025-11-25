/**
 * ExpertRoute
 * Bảo vệ các route yêu cầu quyền Expert. Nếu không phải Expert chuyển hướng về /home.
 */
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";

const ExpertRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 text-lg">
        Đang tải...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role;
  if (role !== "Expert") {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ExpertRoute;
