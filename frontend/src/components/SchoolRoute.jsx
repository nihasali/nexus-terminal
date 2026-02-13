import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function SchoolRoute({ children }) {

  const { user, isAuthenticated, loading } = useSelector(
    (state) => state.auth
  );

  if (loading) return <h3>Loading...</h3>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user.user_type !== "school") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default SchoolRoute;
