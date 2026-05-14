import { useState } from "react";

import AdminNavbar from "../components/admin/AdminNavbar";
import AdminLayout from "../pages/admin/AdminLayout";

const AdminAppLayout = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar onMenuClick={() => setOpen(true)} />

      <AdminLayout open={open} closeSidebar={() => setOpen(false)} />
    </div>
  );
};

export default AdminAppLayout;
