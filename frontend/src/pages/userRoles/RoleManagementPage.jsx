import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

import RoleCard from "../../components/userRoles/RoleCard";
import { formatRoleName } from "../../components/userRoles/RoleCard";

import {
  getAvailableRoles,
  getMyRoles,
  requestRole,
  setPrimaryRole,
  withdrawRoleRequest,
} from "../../api/userRoleApi.js";

const RoleManagementPage = () => {
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const openConfirmModal = ({ title, message, onConfirm }) => {
    setConfirmModal({
      open: true,
      title,
      message,
      onConfirm,
    });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [roles] = await Promise.all([getAvailableRoles(), getMyRoles()]);

      setAvailableRoles(roles || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRequestRole = (name) => {
    openConfirmModal({
      title: "Request access?",
      message: `Request access to the ${formatRoleName(name)} role? Your request will be reviewed before access is granted.`,
      onConfirm: async () => {
        try {
          await requestRole(name);
          toast.success("Role request submitted.");
          await loadData();
        } catch (err) {
          toast.error(
            err?.response?.data?.message || "Unable to request role.",
          );
        }
      },
    });
  };

  const handleWithdraw = (userRoleId, roleName) => {
    openConfirmModal({
      title: "Cancel request?",
      message: `Cancel your pending request for the ${formatRoleName(roleName)} role?`,
      onConfirm: async () => {
        try {
          await withdrawRoleRequest(userRoleId);
          toast.success("Role request cancelled.");
          await loadData();
        } catch (err) {
          toast.error(
            err?.response?.data?.message || "Unable to withdraw request.",
          );
        }
      },
    });
  };

  const handleSetPrimary = (name) => {
    openConfirmModal({
      title: "Switch active role?",
      message: `Make ${formatRoleName(name)} your current active role?`,
      onConfirm: async () => {
        try {
          await setPrimaryRole(name);
          toast.success("Current role updated.");
          await loadData();
        } catch (err) {
          toast.error(
            err?.response?.data?.message || "Unable to update current role.",
          );
        }
      },
    });
  };

  if (loading) return <p>Loading...</p>;

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="border-b border-slate-200 pb-2">
        <h1 className="text-lg font-semibold text-slate-900">My Roles</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Request, manage, and switch between your available roles.
        </p>
      </div>

      {/* Content */}
      {availableRoles.length === 0 ? (
        <div className="rounded-md border border-slate-300 bg-white p-4 text-sm text-slate-500">
          No roles are currently available.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {availableRoles.map((role) => (
            <RoleCard
              key={
                role.userRoleId ? `ur-${role.userRoleId}` : `r-${role.role_id}`
              }
              role={role}
              onRequest={handleRequestRole}
              onWithdraw={handleWithdraw}
              onSetPrimary={handleSetPrimary}
            />
          ))}
        </div>
      )}
      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        onClose={() =>
          setConfirmModal({
            open: false,
            title: "",
            message: "",
            onConfirm: null,
          })
        }
        onConfirm={confirmModal.onConfirm}
      />
    </div>
  );
};
const ConfirmModal = ({ open, title, message, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white px-4 py-2 shadow-xl">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>

        {/* Message */}
        <div className="text-gray-600 text-sm mb-6">{message}</div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              try {
                await onConfirm?.();
                onClose();
              } catch (err) {
                console.error(err);
              } finally {
                setLoading(false);
              }
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-50"
          >
            {loading ? "Processing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default RoleManagementPage;
