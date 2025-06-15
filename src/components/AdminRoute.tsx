
import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const { profile } = useAuth();

  // The AuthProvider wrapper handles the loading state. 
  // If we are here, loading is done.
  // If no profile, user is not logged in.
  // If profile.role is not admin, redirect.
  if (!profile || profile.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
