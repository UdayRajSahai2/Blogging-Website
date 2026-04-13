import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../App";

const AdminRoute = () => {
  const { userAuth } = useContext(UserContext);

  // optional dev logging
  // if (import.meta.env.DEV) {
  //   console.log("ADMIN ROUTE:", userAuth);
  // }

  // not logged in
  if (!userAuth?.access_token) {
    return <Navigate to="/signin" replace />;
  }

  // allow hierarchical admin access
  const allowedRoles = ["admin", "super_admin"];

  if (!allowedRoles.includes(userAuth?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
