import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function StudentRoute({ children }) {

  const { user, isAuthenticated, loading } = useSelector(
    (state) => state.auth
  );

  if (loading) return <h3>Loading...</h3>;

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not student
  if (user.user_type !== "student") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default StudentRoute;
