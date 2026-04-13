import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import apiClient from "../../services/apiClient";

const AdminRoles = () => {
  const [requests, setRequests] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const handleView = async (user) => {
    try {
      const res = await apiClient.get(
        `/api/admin/roles/view-user/${user.user_id}`,
      );

      setSelectedUser(res.data.user);
    } catch (err) {
      toast.error("Failed to load user");
    }
  };
  /* ================= FETCH PENDING ================= */
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/admin/roles/role-requests");
      setRequests(res.data.requests || []);
    } catch {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH APPROVED ================= */
  const fetchApprovedUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/admin/roles/approved-users");
      setApprovedUsers(res.data.users || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  /* ================= APPROVE ================= */
  const handleApprove = async (user_id, role_id) => {
    try {
      const key = `${user_id}-${role_id}`;
      setActionLoading(key);

      await apiClient.patch("/api/admin/roles/role-approve", {
        user_id,
        role_id,
      });

      toast.success("Approved");
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error");
    } finally {
      setActionLoading(null);
    }
  };

  /* ================= REJECT ================= */
  const handleReject = async (user_id, role_id) => {
    try {
      const key = `${user_id}-${role_id}`;
      setActionLoading(key);

      await apiClient.patch("/api/admin/roles/role-reject", {
        user_id,
        role_id,
      });

      toast("Rejected", { icon: "⚠️" });
      fetchRequests();
    } catch {
      toast.error("Error");
    } finally {
      setActionLoading(null);
    }
  };
  const handleRemove = async (user_id, role) => {
    if (!confirm("Remove this role?")) return;

    try {
      await apiClient.delete("/api/admin/roles/remove-user-role", {
        data: { user_id, role },
      });

      toast.success("Removed");
      fetchApprovedUsers();
    } catch {
      toast.error("Failed");
    }
  };
  const handleEdit = async (user) => {
    const newRole = prompt("Enter new role");

    if (!newRole) return;

    try {
      await apiClient.put("/api/admin/roles/update-user-role", {
        user_id: user.user_id,
        oldRole: user.role,
        newRole,
      });

      toast.success("Updated");
      fetchApprovedUsers();
    } catch {
      toast.error("Failed");
    }
  };
  /* ================= FILTER ================= */
  const filteredUsers = approvedUsers.filter((u) =>
    `${u.fullname} ${u.username}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Role Management</h1>

        <button
          onClick={() => {
            activeTab === "pending" ? fetchRequests() : fetchApprovedUsers();
          }}
          className="px-3 py-1 border rounded text-sm"
        >
          Refresh
        </button>
      </div>

      {/* ================= TABS ================= */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => {
            setActiveTab("pending");
            fetchRequests();
          }}
          className={`px-4 py-1 rounded ${
            activeTab === "pending" ? "bg-black text-white" : "border"
          }`}
        >
          Pending
        </button>

        <button
          onClick={() => {
            setActiveTab("approved");
            fetchApprovedUsers();
          }}
          className={`px-4 py-1 rounded ${
            activeTab === "approved" ? "bg-black text-white" : "border"
          }`}
        >
          Approved Users
        </button>
      </div>

      {/* ================= SEARCH ================= */}
      {activeTab === "approved" && (
        <input
          type="text"
          placeholder="Search users..."
          className="mb-4 w-full border px-3 py-2 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      {/* ================= CONTENT ================= */}
      {loading ? (
        <p>Loading...</p>
      ) : activeTab === "pending" ? (
        requests.length === 0 ? (
          <p>No pending requests</p>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const key = `${req.user_id}-${req.role_id}`;
              const isLoading = actionLoading === key;

              return (
                <div
                  key={key}
                  className="border p-4 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{req.User?.fullname}</p>
                    <p className="text-xs text-gray-500">
                      @{req.User?.username}
                    </p>

                    <span className="text-xs bg-gray-200 px-2 py-1 rounded mt-1 inline-block capitalize">
                      {req.Role?.role_name}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(req.user_id, req.role_id)}
                      disabled={isLoading}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      {isLoading ? "..." : "Approve"}
                    </button>

                    <button
                      onClick={() => handleReject(req.user_id, req.role_id)}
                      disabled={isLoading}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : filteredUsers.length === 0 ? (
        <p>No users found</p>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((u) => (
            <div
              key={u.user_id}
              className="border p-4 rounded-lg flex justify-between"
            >
              <div>
                <p className="font-medium">{u.fullname}</p>
                <p className="text-xs text-gray-500">@{u.username}</p>
                <span className="text-xs bg-blue-100 px-2 py-1 rounded capitalize">
                  {u.role}
                </span>
              </div>
              {selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg w-96">
                    <h2 className="text-lg font-semibold mb-3">
                      {selectedUser.fullname}
                    </h2>

                    <p className="text-sm text-gray-600">
                      @{selectedUser.username}
                    </p>

                    <p className="text-sm mt-2">Email: {selectedUser.email}</p>

                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1">Roles</p>
                      <div className="flex gap-2 flex-wrap">
                        {selectedUser.roles.map((r) => (
                          <span
                            key={r}
                            className="px-2 py-1 bg-gray-200 rounded text-xs capitalize"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedUser(null)}
                      className="mt-4 px-3 py-1 bg-black text-white rounded"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
              {/* CRUD ACTIONS */}
              <div className="flex gap-2">
                <button onClick={() => handleView(u)}>View</button>

                <button onClick={() => handleEdit(u)}>Edit</button>

                <button onClick={() => handleRemove(u.user_id, u.role)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRoles;
