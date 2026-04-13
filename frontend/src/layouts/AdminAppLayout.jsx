import AdminNavbar from "../components/admin/AdminNavbar";
import { Outlet } from "react-router-dom";

const AdminAppLayout = () => {
  return (
    <>
      <AdminNavbar />

      <div className="pt-0">
        <Outlet />
      </div>
    </>
  );
};

export default AdminAppLayout;
