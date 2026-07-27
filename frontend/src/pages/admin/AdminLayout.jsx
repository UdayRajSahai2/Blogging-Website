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
  AcademicCapIcon,
  RectangleStackIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

const AdminLayout = ({ open, closeSidebar }) => {
  const baseClass = "block px-4 py-2 rounded transition-colors text-sm";

  const getNavClass = ({ isActive }) =>
    `${baseClass} ${
      isActive ? "bg-black text-white" : "hover:bg-gray-100 text-gray-700"
    }`;
  return (
    <div className="min-h-[calc(100vh-56px)]">
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed top-14 left-0 z-50
        w-64 h-[calc(100vh-56px)]
        bg-white border-r border-gray-200 shadow-sm
        p-4 overflow-y-auto transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
      >
        <nav className="space-y-1">
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

          <NavLink
            to="/admin/approvals"
            className={getNavClass}
            onClick={closeSidebar}
          >
            <div className="flex items-center gap-2">
              <ClipboardDocumentCheckIcon className="w-4 h-4" />
              User Approvals
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

          {/* disabled in production */}
          {/* ROLE REQUESTS */}
          {/* <NavLink
            to="/admin/role-requests"
            className={getNavClass}
            onClick={closeSidebar}
          >
            <div className="flex items-center gap-2">
              <ClipboardDocumentCheckIcon className="w-4 h-4" />
              Role Access Requests
            </div>
          </NavLink> */}

          <NavLink
            to="/admin/enrollments"
            className={getNavClass}
            onClick={closeSidebar}
          >
            <div className="flex items-center gap-2">
              <AcademicCapIcon className="w-4 h-4" />
              Enrollments
            </div>
          </NavLink>
          {/* WEBSITE PAGES */}
          <p className="mt-4 mb-1 px-2 text-xs font-medium tracking-wide text-gray-400">
            WEBSITE PAGES
          </p>

          <NavLink
            to="/admin/pages"
            className={getNavClass}
            onClick={closeSidebar}
          >
            <div className="flex items-center gap-2">
              <RectangleStackIcon className="h-4 w-4" />
              Dynamic Pages
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
      <main className="flex-1 md:ml-64 overflow-x-auto bg-gray-50">
        <div className="mx-auto max-w-7xl p-3">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
