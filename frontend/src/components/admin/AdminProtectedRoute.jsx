
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../../services/authStorage";

function AdminProtectedRoute({ children }) {
  const user = getCurrentUser();
  const token = sessionStorage.getItem("token");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminProtectedRoute;
