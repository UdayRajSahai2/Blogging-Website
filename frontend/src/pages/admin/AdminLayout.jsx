import { NavLink, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";

import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  WalletIcon,
  CreditCardIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const AdminLayout = ({ open, closeSidebar }) => {
  const [pendingCount, setPendingCount] = useState(0);

  const baseClass = "block px-4 py-2 rounded-lg transition-colors text-sm";

  const getNavClass = ({ isActive }) =>
    `${baseClass} ${
      isActive ? "bg-black text-white" : "hover:bg-gray-100 text-gray-700"
    }`;

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
    <div className="flex min-h-[calc(100vh-56px)]">
      {/* OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:sticky
          top-14
          left-0
          z-40
          w-64
          h-[calc(100vh-56px)]
          bg-white
          border-r
          border-gray-200
          shadow-sm
          p-4
          overflow-y-auto
          transition-transform
          duration-300

          ${open ? "translate-x-0" : "-translate-x-full"}

          md:translate-x-0
        `}
      >
        <p className="text-xs text-gray-400 mb-4 px-2">ADMIN</p>

        <nav className="space-y-2">
          {/* DASHBOARD */}
          <NavLink
            to="/admin"
            end
            className={getNavClass}
            onClick={closeSidebar}
          >
            <div className="flex items-center gap-2">
              <HomeIcon className="w-4 h-4" />
              Dashboard
            </div>
          </NavLink>

          {/* USERS */}
          <NavLink
            to="/admin/users"
            className={getNavClass}
            onClick={closeSidebar}
          >
            <div className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4" />
              Users
            </div>
          </NavLink>

          {/* CONTENT */}
          <p className="text-xs text-gray-400 mt-4 mb-1 px-2">CONTENT</p>

          {/* BLOGS */}
          <NavLink
            to="/admin/blogs"
            className={getNavClass}
            onClick={closeSidebar}
          >
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="w-4 h-4" />
              Blogs
            </div>
          </NavLink>

          {/* FINANCE */}
          <p className="text-xs text-gray-400 mt-4 mb-1 px-2">FINANCE</p>

          {/* SUMMARY */}
          <NavLink
            to="/admin/finance"
            end
            className={getNavClass}
            onClick={closeSidebar}
          >
            <div className="flex items-center gap-2">
              <ChartBarIcon className="w-4 h-4" />
              Summary
            </div>
          </NavLink>

          {/* EXPENDITURES */}
          <NavLink
            to="/admin/finance/expenditures"
            className={getNavClass}
            onClick={closeSidebar}
          >
            <div className="flex items-center gap-2">
              <CreditCardIcon className="w-4 h-4" />
              Expenditures
            </div>
          </NavLink>

          {/* BALANCE */}
          <NavLink
            to="/admin/finance/balance"
            className={getNavClass}
            onClick={closeSidebar}
          >
            <div className="flex items-center gap-2">
              <WalletIcon className="w-4 h-4" />
              Balance
            </div>
          </NavLink>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
