// frontend/src/pages/admin/AdminUserApprovals.jsx

import { useEffect, useMemo, useState } from "react";
import {
  getUsersByApprovalStatus,
  updateUserApprovalStatus,
  getEnrollments,
} from "../../api/admin/admin.api";

import { toast } from "react-hot-toast";

const ROWS_PER_PAGE = 10;

const Approvals = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("pending");

  const [processingId, setProcessingId] = useState(null);
  const [processingAction, setProcessingAction] = useState("");

  const [enrollments, setEnrollments] = useState([]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);

      const data = await getEnrollments();
      setEnrollments(data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    user: null,
    action: "",
  });

  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await getUsersByApprovalStatus(status);

      setUsers(res.data || []);
      setStats(res.counts);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [status]);

  const updateStatus = async (id, status) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${status} this user?`,
    );

    if (!confirmed) return;

    setProcessingId(id);
    setProcessingAction(status);

    try {
      await updateUserApprovalStatus(id, status);

      setUsers((prev) => prev.filter((u) => u.user_id !== id));

      toast.success(
        status === "approved"
          ? "User approved successfully."
          : "User rejected successfully.",
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          `Failed to ${status} user. Please try again.`,
      );
    } finally {
      setProcessingId(null);
      setProcessingAction("");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const value = `${user.fullname} ${user.email}`.toLowerCase();

      return value.includes(search.toLowerCase());
    });
  }, [users, search]);

  const totalPages = Math.ceil(filteredUsers.length / ROWS_PER_PAGE);

  const currentUsers = filteredUsers.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE,
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  if (loading) {
    return (
      <div className="h-[60vh] flex justify-center items-center">
        <div className="h-8 w-8 rounded-full border-4 border-gray-300 border-t-black animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-semibold">User Approvals</h1>

          <p className="text-xs text-gray-500">
            Review and manage user registration requests.
          </p>

          <p className="mt-1 text-xs text-blue-600">
            Use the status filter buttons on the right to view Pending,
            Approved, or Rejected users.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full lg:w-auto">
          {/* Search */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full sm:w-60 h-9 rounded-md border px-3 text-sm outline-none focus:ring-1 focus:ring-black"
          />

          {/* Status Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatus("pending")}
              className={`min-w-[110px] px-3 h-9 rounded-md text-xs font-medium transition ${
                status === "pending"
                  ? "bg-yellow-500 text-white"
                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
              }`}
            >
              Pending ({stats.pending})
            </button>

            <button
              onClick={() => setStatus("approved")}
              className={`min-w-[110px] px-3 h-9 rounded-md text-xs font-medium transition ${
                status === "approved"
                  ? "bg-green-600 text-white"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              Approved ({stats.approved})
            </button>

            <button
              onClick={() => setStatus("rejected")}
              className={`min-w-[110px] px-3 h-9 rounded-md text-xs font-medium transition ${
                status === "rejected"
                  ? "bg-red-600 text-white"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              }`}
            >
              Rejected ({stats.rejected})
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded border bg-white overflow-hidden ">
        <div className="max-h-[500px] overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                  User
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                  Email
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                  Mobile
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900">
                  Referrer Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900">
                  Referrer Mobile
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900">
                  Referrer Email
                </th>

                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900">
                  Referrer District
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                  Registered
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                  Status
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-gray-500">
                    {status === "pending"
                      ? "No pending approval requests"
                      : status === "approved"
                        ? "No approved users"
                        : "No rejected users"}
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => {
                  const enrollment = enrollments.find(
                    (e) => Number(e.user_id) === Number(user.user_id),
                  );

                  return (
                    <tr
                      key={user.user_id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="text-xs font-semibold text-gray-500">
                            #{user.user_id}
                          </div>

                          <span className="font-medium text-xs">
                            {user.fullname || "No Name"}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-2 text-[12px] text-gray-600">
                        {user.email}
                      </td>

                      <td className="px-3 py-2 text-[12px] text-gray-600">
                        {user.mobile_number || user.mobile || user.phone || "-"}
                      </td>

                      <td className="px-3 py-2 text-[12px] text-gray-600">
                        {user.enrollment?.referrer_name || "-"}
                      </td>

                      <td className="px-3 py-2 text-[12px] text-gray-600">
                        {user.enrollment?.referrer_mobile || "-"}
                      </td>

                      <td className="px-3 py-2 text-[12px] text-gray-600">
                        {user.enrollment?.referrer_email || "-"}
                      </td>

                      <td className="px-3 py-2 text-[12px] text-gray-600">
                        {user.enrollment?.referrer_district || "-"}
                      </td>

                      <td className="px-3 py-2 text-[12px] text-gray-700 whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString("en-GB")} •{" "}
                        {new Date(user.createdAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </td>

                      <td className="px-3 py-2">
                        <span
                          className={`inline-block px-2 py-0.5 text-[12px] font-medium ${
                            user.approval_status === "approved"
                              ? "text-green-700"
                              : user.approval_status === "rejected"
                                ? "text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {user.approval_status}
                        </span>
                      </td>

                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-2">
                          <button
                            disabled={
                              user.approval_status === "approved" ||
                              processingId === user.user_id
                            }
                            onClick={() =>
                              updateStatus(user.user_id, "approved")
                            }
                            className={`h-7 px-2.5 rounded-md text-[12px] font-medium transition ${
                              user.approval_status === "approved"
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : processingId === user.user_id
                                  ? "bg-green-400 text-white cursor-wait"
                                  : "bg-green-600 hover:bg-green-700 text-white"
                            }`}
                          >
                            {processingId === user.user_id &&
                            processingAction === "approved"
                              ? "Approving..."
                              : "Approve"}
                          </button>

                          <button
                            disabled={
                              user.approval_status === "rejected" ||
                              processingId === user.user_id
                            }
                            onClick={() =>
                              updateStatus(user.user_id, "rejected")
                            }
                            className={`h-7 px-2.5 rounded-md text-[12px] font-medium transition ${
                              user.approval_status === "rejected"
                                ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                                : processingId === user.user_id
                                  ? "border border-red-300 bg-red-100 text-red-600 cursor-wait"
                                  : "border border-red-300 text-red-600 hover:bg-red-50"
                            }`}
                          >
                            {processingId === user.user_id &&
                            processingAction === "rejected"
                              ? "Rejecting..."
                              : "Reject"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-3">
          <p className="text-xs text-gray-500">
            Page {page} of {totalPages}
          </p>

          <div className="flex gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="h-7 px-3 border rounded text-xs disabled:opacity-40"
            >
              Prev
            </button>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="h-7 px-3 border rounded text-xs disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvals;
