import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ExpertRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== "Expert") {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ExpertRoute;
