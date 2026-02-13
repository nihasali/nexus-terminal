import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function TeacherRoute({ children }) {

  const { user, isAuthenticated, loading } = useSelector(
    (state) => state.auth
  );

  if (loading) return <h3>Loading...</h3>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user.user_type !== "teacher") {
    return <Navigate to="/login" replace />;
  }

  // Only block dashboard if not completed
  if (user.is_setup_complete === false) {
    return <Navigate to="/teacher/complete-profile" replace />;
  }

  return children;
}

export default TeacherRoute;
