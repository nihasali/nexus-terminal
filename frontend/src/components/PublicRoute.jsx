// import { useSelector } from "react-redux";
// import { Navigate } from "react-router-dom";

// function PublicRoute({ children }) {
//   const { isAuthenticated, loading } = useSelector(
//     (state) => state.auth
//   );

//   if (loading) {
//     return <h3>Loading...</h3>;
//   }

//   if (isAuthenticated) {
//     return <Navigate to="/Schooldashboard" replace />;
//   }

//   return children;
// }

// export default PublicRoute;
