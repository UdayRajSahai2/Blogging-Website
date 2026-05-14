import { useContext } from "react";
import { Navigate } from "react-router-dom";

import { UserContext } from "../App";

const AdminRoute = ({ children }) => {
  const { userAuth } = useContext(UserContext);

  // not logged in
  if (!userAuth?.access_token) {
    return <Navigate to="/signin" replace />;
  }

  // allow hierarchical admin access
  const allowedRoles = ["admin", "super_admin"];

  if (!allowedRoles.includes(userAuth?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
