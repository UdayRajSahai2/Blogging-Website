import { NavLink, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import {
  LayoutDashboard,
  Users,
  FileText,
  Heart,
  ShieldCheck,
  Settings,
  Wallet,
  CreditCard,
  BarChart3,
} from "lucide-react";
const AdminLayout = () => {
  const [open, setOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const baseClass = "block px-4 py-2 rounded-lg transition-colors text-sm";

  const getNavClass = ({ isActive }) =>
    `${baseClass} ${
      isActive ? "bg-black text-white" : "hover:bg-gray-100 text-gray-700"
    }`;

  const closeSidebar = () => setOpen(false);
  const fetchPendingCount = async () => {
    try {
      const res = await apiClient.get("/api/admin/roles/role-requests/count");
      setPendingCount(res.data.count || 0);
    } catch (err) {
      console.error("COUNT ERROR:", err);
    }
  };

  useEffect(() => {
    fetchPendingCount();
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      {/*  MOBILE HEADER (no duplicate title) */}
      <div className="md:hidden flex items-center justify-between p-3 border-b bg-white">
        <button
          onClick={() => setOpen(true)}
          className="text-xl px-3 py-1 border rounded"
        >
          ☰
        </button>
      </div>

      {/* OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <div className="flex">
        {/*  SIDEBAR */}
        <aside
          className={`
  fixed md:static top-16 left-0 z-40 w-64
  bg-white border-r border-gray-200 shadow-sm
  p-3 md:p-4
  h-[calc(100vh-4rem)] md:h-auto
  transform transition-transform duration-300
  ${open ? "translate-x-0" : "-translate-x-full"}
  md:translate-x-0
`}
        >
          {/*  SMALL LABEL INSTEAD OF BIG TITLE */}
          <p className="text-xs text-gray-400 mb-4 px-2">ADMIN</p>

          <nav className="space-y-2">
            <NavLink
              to="/admin"
              end
              className={getNavClass}
              onClick={closeSidebar}
            >
              <div className="flex items-center gap-2">
                <LayoutDashboard size={16} />
                Dashboard
              </div>
            </NavLink>

            <NavLink
              to="/admin/users"
              className={getNavClass}
              onClick={closeSidebar}
            >
              <div className="flex items-center gap-2">
                <Users size={16} />
                Users
              </div>
            </NavLink>

            <p className="text-xs text-gray-400 mt-4 mb-1 px-2">CONTENT</p>

            <NavLink
              to="/admin/blogs"
              className={getNavClass}
              onClick={closeSidebar}
            >
              <div className="flex items-center gap-2">
                <FileText size={16} />
                Blogs
              </div>
            </NavLink>

            <p className="text-xs text-gray-400 mt-4 mb-1 px-2">
              ACCESS CONTROL
            </p>

            <NavLink
              to="/admin/roles/requests"
              className={getNavClass}
              onClick={closeSidebar}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} />
                  Role Approvals
                </div>

                {pendingCount > 0 && (
                  <span className="text-xs bg-red-500 text-white px-2 rounded-full">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </div>
            </NavLink>

            <NavLink
              to="/admin/roles/manage"
              className={getNavClass}
              onClick={closeSidebar}
            >
              <div className="flex items-center gap-2">
                <Settings size={16} />
                Roles
              </div>
            </NavLink>

            <p className="text-xs text-gray-400 mt-4 mb-1 px-2">FINANCE</p>

            <NavLink
              to="/admin/finance"
              end
              className={getNavClass}
              onClick={closeSidebar}
            >
              <div className="flex items-center gap-2">
                <BarChart3 size={16} />
                Summary
              </div>
            </NavLink>

            <NavLink
              to="/admin/finance/expenditures"
              className={getNavClass}
              onClick={closeSidebar}
            >
              <div className="flex items-center gap-2">
                <CreditCard size={16} />
                Expenditures
              </div>
            </NavLink>

            <NavLink
              to="/admin/finance/balance"
              className={getNavClass}
              onClick={closeSidebar}
            >
              <div className="flex items-center gap-2">
                <Wallet size={16} />
                Balance
              </div>
            </NavLink>
          </nav>
        </aside>

        {/* 🔹 MAIN CONTENT */}
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
