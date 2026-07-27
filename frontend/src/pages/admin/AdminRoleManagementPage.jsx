import React, { useEffect, useState } from "react";

import RoleRequestTable from "../../components/admin/RoleRequestTable";

import {
  getRoleRequests,
  approveRoleRequest,
  rejectRoleRequest,
  revokeRoleRequest,
} from "../../api/admin/admin-role-management.api.js";

const AdminRoleManagementPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const loadRequests = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);

      const data = await getRoleRequests();
      setRequests(data);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests(true);
  }, []);

  const handleApprove = async (userRoleId) => {
    try {
      await approveRoleRequest(userRoleId);
      await loadRequests(false);
    } catch (err) {
      alert(err?.response?.data?.message || "Approve failed.");
    }
  };

  const handleReject = async (userRoleId) => {
    try {
      await rejectRoleRequest(userRoleId);
      await loadRequests(false);
    } catch (err) {
      alert(err?.response?.data?.message || "Reject failed.");
    }
  };

  const handleRevoke = async (userRoleId) => {
    try {
      await revokeRoleRequest(userRoleId);
      await loadRequests(false);
    } catch (err) {
      alert(err?.response?.data?.message || "Revoke failed.");
    }
  };
  const filteredRequests = requests.filter((item) => {
    const search = searchTerm.toLowerCase();

    return (
      item.userName?.toLowerCase().includes(search) ||
      item.email?.toLowerCase().includes(search) ||
      item.role?.toLowerCase().includes(search) ||
      item.status?.toLowerCase().includes(search)
    );
  });
  // Statistics
  const total = requests.length;
  const pending = requests.filter((item) => item.status === "pending").length;
  const approved = requests.filter((item) => item.status === "approved").length;
  const revoked = requests.filter((item) => item.status === "revoked").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white shadow-lg rounded-xl px-2 py-2">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-700 font-medium">
              Loading role requests...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>

          <button
            onClick={loadRequests}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Role Management
            </h1>
            <p className="text-gray-500 mt-1">
              Manage user role requests and permissions.
            </p>
          </div>

          <button
            onClick={loadRequests}
            className="mt-4 md:mt-0 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Refresh
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search name, email, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-72 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Stats */}
          <div className="flex flex-wrap gap-2">
            <div className="px-2 py-1 bg-gray-100 rounded text-xs">
              Total: <span className="font-semibold">{total}</span>
            </div>

            <div className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs">
              Pending: <span className="font-semibold">{pending}</span>
            </div>

            <div className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
              Approved: <span className="font-semibold">{approved}</span>
            </div>

            <div className="px-2 py-1 bg-gray-50 text-gray-700 rounded text-xs">
              Revoked: <span className="font-semibold">{revoked}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <RoleRequestTable
          requests={filteredRequests}
          onApprove={handleApprove}
          onReject={handleReject}
          onRevoke={handleRevoke}
        />
      </div>
    </div>
  );
};

export default AdminRoleManagementPage;
