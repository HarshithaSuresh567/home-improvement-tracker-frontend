import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

const PrivateRoute = ({ children }) => {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return <div className="page-loader">Loading...</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
