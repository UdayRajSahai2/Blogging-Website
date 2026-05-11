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
  const [filter, setFilter] = useState("all"); // all | active | deleted
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processingId, setProcessingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  //  search state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const explainCustomerId = (user) => {
    return `
Country: ${user.country_code || "000"}
State: ${user.state_code || "00"}
District: ${user.district_code || "00"}
Block: ${user.block_code || "00"}
Village: ${user.village_code || "000"}
`;
  };
  // ================= DEBOUNCE =================
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(t);
  }, [search]);

  // ================= FETCH USERS =================
  const fetchUsers = useCallback(
    async (signal) => {
      if (!token) return;

      setLoading(true);
      setError("");

      try {
        const { data } = await axios.get(`${ADMIN_API}/users`, {
          headers: { Authorization: `Bearer ${token}` },
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

        console.error("Fetch users error", err);
        setError("Failed to load users");
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    },
    [token, page, debouncedSearch, filter],
  );

  // ================= EFFECT =================
  useEffect(() => {
    setPage(1);
  }, [filter]);
  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();
    fetchUsers(controller.signal);

    return () => controller.abort();
  }, [fetchUsers, token]);

  // ================= ROLE CHANGE =================
  const changeRole = async (userId, system_role) => {
    if (userId === currentUserId) {
      toast.error("You cannot change your own system role");
      return;
    }

    try {
      setProcessingId(userId);

      await axios.patch(
        `${ADMIN_API}/users/${userId}/role`,
        { system_role },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("System Role updated");
      fetchUsers();
    } catch (err) {
      console.error("System Role update error", err);
      toast.error("Failed to update system role");
    } finally {
      setProcessingId(null);
    }
  };

  // ================= DELETE USER =================
  const deleteUser = async (userId) => {
    if (userId === currentUserId) {
      toast.error("You cannot delete your own account");
      return;
    }

    if (!window.confirm("Soft delete this user?")) return;

    try {
      setProcessingId(userId);

      await axios.delete(`${ADMIN_API}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("User moved to trash");
      fetchUsers();
    } catch (err) {
      console.error("Delete user error", err);
      toast.error("Failed to delete user");
    } finally {
      setProcessingId(null);
    }
  };
  const deleteUserPermanent = async (userId) => {
    if (
      !window.confirm(" Permanently delete this user? This cannot be undone.")
    )
      return;

    try {
      setProcessingId(userId);

      await axios.delete(`${ADMIN_API}/users/${userId}/permanent`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("User permanently deleted");
      fetchUsers();
    } catch (err) {
      console.error("Permanent delete error", err);
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
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success("User restored");
      fetchUsers();
    } catch (err) {
      toast.error("Failed to restore user");
    } finally {
      setProcessingId(null);
    }
  };
  {
    /* ================= MAIN UI ================= */
  }

  return (
    <div className="w-full max-w-full overflow-hidden px-0 sm:px-4">
      {/* HEADER */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-lg sm:text-2xl font-bold">Users Management</h1>

          <div className="text-xs sm:text-sm text-gray-500">
            Total Users: {users?.length || 0}
          </div>
        </div>

        {/* SEARCH */}
        <div className="w-full">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 p-2 border rounded-lg"
          />
        </div>

        {/* FILTER */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded ${
              filter === "all" ? "bg-black text-white" : "border"
            }`}
          >
            All
          </button>

          <button
            onClick={() => setFilter("active")}
            className={`px-3 py-1 rounded ${
              filter === "active" ? "bg-green-600 text-white" : "border"
            }`}
          >
            Active
          </button>

          <button
            onClick={() => setFilter("deleted")}
            className={`px-3 py-1 rounded ${
              filter === "deleted" ? "bg-red-500 text-white" : "border"
            }`}
          >
            Deleted
          </button>
        </div>

        {/* TABLE */}
        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-3">
          {users.map((u) => {
            const isProcessing = processingId === u.user_id;
            const isSelf = u.user_id === currentUserId;

            return (
              <div
                key={u.user_id}
                className={`border rounded-xl p-3 bg-white shadow-sm ${
                  u.is_deleted ? "bg-red-50 opacity-70" : ""
                }`}
              >
                {/* TOP */}
                <div className="flex justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                      {u.fullname}
                    </h3>

                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  </div>

                  <span className="text-[10px] capitalize font-semibold whitespace-nowrap">
                    {u.system_role}
                  </span>
                </div>
                {/* CUSTOMER ID */}
                <div
                  className=" text-[12px] font-mono text-cyan-700 break-all"
                  title={`Country: ${u.country_code}
                          State: ${u.state_code}
                          District: ${u.district_code}
                          Block: ${u.block_code}
                          Village: ${u.village_code}
                          Unique: ${u.customer_id?.slice(-4)}`}
                >
                  [{u.country_code} {u.state_code} {u.district_code}
                  {u.block_code} {u.village_code} {u.customer_id?.slice(-4)}]
                </div>
                {/* META */}
                <div className="mt-2 flex justify-between text-[11px] text-gray-500">
                  <span>
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString()
                      : "-"}
                  </span>

                  <span
                    className={
                      u.is_deleted
                        ? "text-red-500 font-semibold"
                        : "text-green-600 font-semibold"
                    }
                  >
                    {u.is_deleted ? "Deleted" : "Active"}
                  </span>
                </div>
                {/* ACTIONS */}
                <div className="flex flex-wrap justify-start gap-1">
                  {!isSelf ? (
                    <>
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
                          {confirmId === u.user_id ? (
                            <>
                              <button
                                className="bg-gray-300 px-2 py-1 rounded"
                                onClick={() => setConfirmId(null)}
                              >
                                Cancel
                              </button>

                              <button
                                className="bg-black text-white px-2 py-1 rounded"
                                onClick={() => {
                                  deleteUserPermanent(u.user_id);
                                  setConfirmId(null);
                                }}
                              >
                                Confirm Delete
                              </button>
                            </>
                          ) : (
                            <button
                              disabled={isProcessing}
                              className="bg-black hover:bg-gray-900 text-white px-3 py-1 rounded"
                              onClick={() => setConfirmId(u.user_id)}
                            >
                              Delete Permanently
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          {/* SOFT DELETE */}
                          {confirmId === u.user_id ? (
                            <>
                              <button
                                className="bg-gray-300 px-2 py-1 rounded"
                                onClick={() => setConfirmId(null)}
                              >
                                Cancel
                              </button>

                              <button
                                className="bg-red-600 text-white px-2 py-1 rounded"
                                onClick={() => {
                                  deleteUser(u.user_id);
                                  setConfirmId(null);
                                }}
                              >
                                Confirm
                              </button>
                            </>
                          ) : (
                            <button
                              disabled={isProcessing}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                              onClick={() => setConfirmId(u.user_id)}
                            >
                              Delete
                            </button>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-gray-500">Current User</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block w-full overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-xs sm:text-sm min-w-[900px]">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3">ID</th>
                <th>Name</th>
                <th>Customer ID</th>
                <th>Email</th>
                <th>System Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => {
                const isProcessing = processingId === u.user_id;
                const isSelf = u.user_id === currentUserId;

                return (
                  <tr
                    key={u.user_id}
                    className={`border-t ${
                      u.is_deleted ? "bg-red-50 opacity-60" : ""
                    }`}
                  >
                    <td className="p-3">{u.user_id}</td>
                    <td>{u.fullname}</td>
                    <td className="text-[12px] font-mono whitespace-nowrap relative group">
                      <span className="text-cyan-700">
                        [{u.country_code} {u.state_code} {u.district_code}
                        {u.block_code} {u.village_code}{" "}
                        {u.customer_id?.slice(-4)}]
                      </span>

                      <div className="absolute hidden group-hover:block left-0 top-4 z-50 bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                        {u.country_code}=Country | {u.state_code}=State |{" "}
                        {u.district_code}=District | {u.block_code}=Block |{" "}
                        {u.village_code}=Village | {u.customer_id?.slice(-4)}=
                        Unique
                      </div>
                    </td>

                    <td>{u.email}</td>
                    <td className="font-semibold capitalize">
                      {u.system_role}
                    </td>

                    <td>
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString()
                        : "-"}
                    </td>

                    {/* STATUS */}
                    <td>
                      {u.is_deleted ? (
                        <span className="text-red-500 font-semibold">
                          Deleted
                        </span>
                      ) : (
                        <span className="text-green-600 font-semibold">
                          Active
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="space-x-2 text-center">
                      {!isSelf ? (
                        <>
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
                              {confirmId === u.user_id ? (
                                <>
                                  <button
                                    className="bg-gray-300 px-2 py-1 rounded"
                                    onClick={() => setConfirmId(null)}
                                  >
                                    Cancel
                                  </button>

                                  <button
                                    className="bg-black text-white px-2 py-1 rounded"
                                    onClick={() => {
                                      deleteUserPermanent(u.user_id);
                                      setConfirmId(null);
                                    }}
                                  >
                                    Confirm Delete
                                  </button>
                                </>
                              ) : (
                                <button
                                  disabled={isProcessing}
                                  className="bg-black hover:bg-gray-900 text-white px-3 py-1 rounded"
                                  onClick={() => setConfirmId(u.user_id)}
                                >
                                  Delete Permanently
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              {/* SOFT DELETE */}
                              {confirmId === u.user_id ? (
                                <>
                                  <button
                                    className="bg-gray-300 px-2 py-1 rounded"
                                    onClick={() => setConfirmId(null)}
                                  >
                                    Cancel
                                  </button>

                                  <button
                                    className="bg-red-600 text-white px-2 py-1 rounded"
                                    onClick={() => {
                                      deleteUser(u.user_id);
                                      setConfirmId(null);
                                    }}
                                  >
                                    Confirm
                                  </button>
                                </>
                              ) : (
                                <button
                                  disabled={isProcessing}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                                  onClick={() => setConfirmId(u.user_id)}
                                >
                                  Delete
                                </button>
                              )}
                            </>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-gray-500">
                          Current User
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between items-center mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Prev
          </button>

          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
export default AdminUsers;
