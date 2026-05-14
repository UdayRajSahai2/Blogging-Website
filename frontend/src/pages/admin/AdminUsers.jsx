import { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { UserContext } from "../../App";
import { ADMIN_API } from "../../common/api";
import toast from "react-hot-toast";

const AdminUsers = () => {
  const { userAuth } = useContext(UserContext);

  const token = userAuth?.access_token;
  const currentUserId = userAuth?.user_id;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [processingId, setProcessingId] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ================= DEBOUNCE =================

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // ================= FETCH USERS =================

  const fetchUsers = useCallback(
    async (signal) => {
      if (!token) return;

      setLoading(true);
      setError("");

      try {
        const { data } = await axios.get(`${ADMIN_API}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page,
            limit: 10,
            search: debouncedSearch || undefined,
            deleted:
              filter === "all"
                ? undefined
                : filter === "deleted"
                  ? "true"
                  : "false",
          },
          signal,
        });

        setUsers(data?.data || []);
        setTotalPages(data?.pagination?.totalPages || 1);
      } catch (err) {
        if (axios.isCancel(err)) return;

        console.error(err);
        setError("Failed to load users");
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    },
    [token, page, debouncedSearch, filter],
  );

  useEffect(() => {
    setPage(1);
  }, [filter]);

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    fetchUsers(controller.signal);

    return () => controller.abort();
  }, [fetchUsers, token]);

  // ================= HELPERS =================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString();
  };

  // ================= ACTIONS =================

  const changeRole = async (userId, system_role) => {
    if (userId === currentUserId) {
      toast.error("You cannot change your own role");
      return;
    }

    const actionText =
      system_role === "admin"
        ? "make this user admin"
        : "remove admin access from this user";

    if (!window.confirm(`Are you sure you want to ${actionText}?`)) {
      return;
    }

    try {
      setProcessingId(userId);

      await axios.patch(
        `${ADMIN_API}/users/${userId}/role`,
        { system_role },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("System role updated");

      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update role");
    } finally {
      setProcessingId(null);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Soft delete this user?")) return;

    try {
      setProcessingId(userId);

      await axios.delete(`${ADMIN_API}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("User moved to trash");

      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user");
    } finally {
      setProcessingId(null);
    }
  };

  const deleteUserPermanent = async (userId) => {
    if (!window.confirm("Permanently delete this user? This cannot be undone."))
      return;

    try {
      setProcessingId(userId);

      await axios.delete(`${ADMIN_API}/users/${userId}/permanent`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("User permanently deleted");

      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to permanently delete user");
    } finally {
      setProcessingId(null);
    }
  };

  const restoreUser = async (userId) => {
    try {
      setProcessingId(userId);

      await axios.patch(
        `${ADMIN_API}/users/${userId}/restore`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("User restored");

      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to restore user");
    } finally {
      setProcessingId(null);
    }
  };
  const adminCount = users.filter(
    (user) => user.system_role === "admin",
  ).length;

  const userCount = users.filter((user) => user.system_role === "user").length;
  // ================= REUSABLE ACTIONS =================

  const UserActions = ({ u }) => {
    const isProcessing = processingId === u.user_id;
    const isSelf = u.user_id === currentUserId;

    if (isSelf) {
      return <span className="text-xs text-gray-500">Current User</span>;
    }

    return (
      <div className="flex flex-wrap justify-center gap-1">
        {/* ROLE */}
        {!u.is_deleted &&
          (u.system_role === "user" ? (
            <button
              disabled={isProcessing}
              className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-3 py-1 rounded"
              onClick={() => changeRole(u.user_id, "admin")}
            >
              {isProcessing ? "..." : "Make Admin"}
            </button>
          ) : (
            <button
              disabled={isProcessing}
              className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white px-3 py-1 rounded"
              onClick={() => changeRole(u.user_id, "user")}
            >
              {isProcessing ? "..." : "Remove Admin"}
            </button>
          ))}

        {u.is_deleted ? (
          <>
            {/* RESTORE */}
            <button
              disabled={isProcessing}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
              onClick={() => restoreUser(u.user_id)}
            >
              {isProcessing ? "..." : "Restore"}
            </button>

            {/* PERMANENT DELETE */}
            <button
              disabled={isProcessing}
              className="bg-black hover:bg-gray-900 text-white px-3 py-1 rounded"
              onClick={() => deleteUserPermanent(u.user_id)}
            >
              {isProcessing ? "..." : "Delete Permanently"}
            </button>
          </>
        ) : (
          <button
            disabled={isProcessing}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            onClick={() => deleteUser(u.user_id)}
          >
            {isProcessing ? "..." : "Delete"}
          </button>
        )}
      </div>
    );
  };

  // ================= LOADING =================

  if (loading) {
    return <div className="p-5 text-center">Loading users...</div>;
  }

  // ================= ERROR =================

  if (error) {
    return <div className="p-5 text-center text-red-500">{error}</div>;
  }

  // ================= MAIN UI =================

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-bold">Users Management</h1>

          <div className="flex items-center gap-4 text-sm font-semibold text-stone-700">
            <span>Total: {users.length}</span>

            <span className="text-purple-700">Admins: {adminCount}</span>

            <span className="text-blue-700">Users: {userCount}</span>
          </div>
        </div>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-80 p-2 border rounded-lg"
        />

        {/* FILTER */}
        <div className="flex flex-wrap gap-2">
          {["all", "active", "deleted"].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-3 py-1 rounded capitalize ${
                filter === item ? "bg-black text-white" : "border"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* NO USERS */}
      {users.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center text-gray-500">
          No users found
        </div>
      ) : (
        <>
          {/* TABLE */}
          <div
            className="w-full overflow-x-auto border border-gray-200 rounded-md bg-white"
            style={{ overflowY: "hidden" }}
          >
            <table className="min-w-[980px] w-full text-[12px] leading-normal">
              <thead className="bg-gray-50 border-b">
                <tr className="text-gray-500">
                  <th className="px-2 py-1.5 text-left font-semibold">ID</th>
                  <th className="px-2 py-1.5 text-left font-semibold">Name</th>
                  <th className="px-2 py-1.5 text-left font-semibold">
                    Customer ID
                  </th>
                  <th className="px-2 py-1.5 text-left font-semibold">Email</th>
                  <th className="px-2 py-1.5 text-left font-semibold">
                    System Role
                  </th>
                  <th className="px-2 py-1.5 text-left font-semibold">
                    Joined
                  </th>
                  <th className="px-2 py-1.5 text-left font-semibold">
                    Status
                  </th>
                  <th className="px-2 py-1.5 text-center font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.user_id}
                    className={`
                        border-b last:border-0
                         hover:bg-gray-50 transition
                         ${u.is_deleted ? "bg-red-50/40" : ""}
                     `}
                  >
                    {/* ID */}
                    <td className="px-2 py-1.5 text-gray-500">#{u.user_id}</td>

                    {/* NAME */}
                    <td className="px-2 py-1.5 font-medium whitespace-nowrap">
                      {u.fullname}
                    </td>

                    {/* CUSTOMER ID */}
                    <td className="px-2 py-1.5 font-mono text-cyan-700 text-[12px] whitespace-nowrap">
                      [{u.country_code} {u.state_code} {u.district_code}{" "}
                      {u.block_code} {u.village_code} {u.customer_id?.slice(-4)}
                      ]
                    </td>

                    {/* EMAIL */}
                    <td className="px-2 py-1.5 text-gray-600 whitespace-nowrap">
                      {u.email}
                    </td>

                    {/* ROLE */}
                    <td className="px-2 py-1.5">
                      <span
                        className={`
                px-2 py-[2px] rounded text-[11px] font-semibold uppercase
                ${
                  u.system_role === "admin"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
                }
              `}
                      >
                        {u.system_role}
                      </span>
                    </td>

                    {/* JOINED */}
                    <td className="px-2 py-1.5 text-gray-500 whitespace-nowrap">
                      {formatDate(u.createdAt)}
                    </td>

                    {/* STATUS */}
                    <td className="px-2 py-1.5">
                      <span
                        className={`
                px-2 py-[2px] rounded text-[11px] font-semibold
                ${
                  u.is_deleted
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-700"
                }
              `}
                      >
                        {u.is_deleted ? "Deleted" : "Active"}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-2 py-1.5">
                      <div className="flex justify-center gap-1">
                        <UserActions u={u} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2">
            <div className="inline-flex rounded-md border border-cyan-200 bg-cyan-50 px-1 py-1 text-[10px] text-cyan-800">
              <span className="font-semibold mr-1">Customer ID Format:</span>
              Country • State • District • Block • Village • Unique ID
            </div>
          </div>
          {/* PAGINATION */}
          <div className="flex justify-between items-center mt-3">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 rounded bg-gray-800 text-white disabled:opacity-40"
            >
              Prev
            </button>

            <span className="text-sm font-medium">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded bg-gray-800 text-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminUsers;
