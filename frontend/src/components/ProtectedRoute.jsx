import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const {isAuthenticated,loading} = useSelector(
    (state) => state.auth
  );
  if (loading) {
    return <h3>Loading...</h3>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
