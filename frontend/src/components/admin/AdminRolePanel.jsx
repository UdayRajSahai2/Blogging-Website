import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";

export default function AdminRolePanel() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleName, setRoleName] = useState("");

  const ITEMS_PER_PAGE = 5;

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/admin/roles/all-roles");
      setRoles(res.data.roles || []);
    } catch (err) {
      toast.error("Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSubmit = async () => {
    try {
      if (!roleName.trim()) return toast.error("Role name required");

      if (editingRole) {
        await apiClient.put(
          `/api/admin/roles/update-role/${editingRole.role_id}`,
          {
            role_name: roleName,
          },
        );
        toast.success("Role updated");
      } else {
        await apiClient.post("/api/admin/roles/create-role", {
          role_name: roleName,
        });
        toast.success("Role created");
      }

      setModalOpen(false);
      setRoleName("");
      setEditingRole(null);
      fetchRoles();
    } catch (err) {
      toast.error(err.response?.data?.error || "Action failed");
    }
  };

  const handleDelete = async (role_id) => {
    if (!confirm("Delete this role?")) return;

    try {
      await apiClient.delete(`/api/admin/roles/delete-role/${role_id}`);
      toast.success("Role deleted");
      fetchRoles();
    } catch (err) {
      toast.error(err.response?.data?.error || "Delete failed");
    }
  };

  const openEdit = (role) => {
    setEditingRole(role);
    setRoleName(role.role_name);
    setModalOpen(true);
  };

  const filtered = roles.filter((r) =>
    r.role_name.toLowerCase().includes(search.toLowerCase()),
  );

  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Role Management</h1>
        <button
          onClick={() => {
            setModalOpen(true);
            setEditingRole(null);
            setRoleName("");
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Create Role
        </button>
      </div>

      <input
        type="text"
        placeholder="Search role..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full border px-3 py-2 rounded"
      />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="border rounded">
          {paginated.map((role) => (
            <div
              key={role.role_id}
              className="flex justify-between items-center p-3 border-b"
            >
              <span className="capitalize">{role.role_name}</span>

              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(role)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(role.role_id)}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-4 gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 border rounded ${
              page === i + 1 ? "bg-blue-600 text-white" : ""
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-80">
            <h2 className="text-lg font-semibold mb-3">
              {editingRole ? "Edit Role" : "Create Role"}
            </h2>

            <input
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Role name"
              className="w-full border px-3 py-2 mb-3 rounded"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
