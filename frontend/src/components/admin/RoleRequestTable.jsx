import React, { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
const RoleRequestTable = ({ requests, onApprove, onReject, onRevoke }) => {
  const [expandedUser, setExpandedUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const groupedUsers = Object.values(
    requests.reduce((acc, item) => {
      const key = item.email;

      if (!acc[key]) {
        acc[key] = {
          userName: item.userName,
          email: item.email,
          roles: [],
        };
      }

      acc[key].roles.push(item);

      return acc;
    }, {}),
  );
  if (!requests.length) {
    return (
      <div className="flex items-center justify-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="text-center">
          <div className="text-5xl mb-2">📋</div>
          <h3 className="text-lg font-semibold text-gray-700">
            No Role Requests
          </h3>
          <p className="text-gray-500 mt-1">
            There are currently no role records available.
          </p>
        </div>
      </div>
    );
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "revoked":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };
  return (
    <div className="overflow-hidden">
      <div className="space-y-3 p-4">
        {groupedUsers.map((user) => {
          const pendingCount = user.roles.filter(
            (role) => role.status?.toLowerCase() === "pending",
          ).length;

          return (
            <div
              key={user.email}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200"
            >
              {/* Header */}
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-[14px] text-gray-800 truncate">
                      {user.userName}
                    </h4>

                    <p className="text-[11px] text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>

                  <span className="hidden sm:inline-flex px-2 py-1 text-[12px] font-medium rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                    {user.roles.length} Roles
                  </span>

                  {pendingCount > 0 && (
                    <span className="px-2 py-1 text-[12px] font-medium rounded-md bg-yellow-100 text-yellow-700 border border-yellow-200">
                      {pendingCount} Pending
                    </span>
                  )}
                </div>

                <button
                  onClick={() =>
                    setExpandedUser(
                      expandedUser === user.email ? null : user.email,
                    )
                  }
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                >
                  <span className="text-sm font-medium">
                    {expandedUser === user.email ? "Hide" : "View"}
                  </span>

                  <ChevronDownIcon
                    className={`h-5 w-5 transition-transform duration-200 ${
                      expandedUser === user.email ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Expanded Roles */}
              {expandedUser === user.email && (
                <div className="border-t bg-gray-50">
                  {user.roles.map((role) => (
                    <div
                      key={role.userRoleId}
                      className="flex items-center justify-between px-4 py-3 hover:bg-white transition-colors border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-medium text-gray-800">
                          {role.role}
                        </span>

                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            role.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : role.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : role.status === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {role.status}
                        </span>

                        {role.isPrimary && (
                          <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                            Primary
                          </span>
                        )}

                        {role.requestedAt && (
                          <span className="text-xs text-gray-500">
                            {new Date(role.requestedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {role.status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmAction({
                                  type: "approve",
                                  roleId: role.userRoleId,
                                  role: role.role,
                                  user: user.userName,
                                })
                              }
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 active:scale-95 transition-all"
                            >
                              Approve
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setConfirmAction({
                                  type: "reject",
                                  roleId: role.userRoleId,
                                  role: role.role,
                                  user: user.userName,
                                })
                              }
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {role.status === "approved" && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmAction({
                                type: "revoke",
                                roleId: role.userRoleId,
                                role: role.role,
                                user: user.userName,
                              })
                            }
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-700 text-white hover:bg-gray-900 active:scale-95 transition-all"
                          >
                            Revoke
                          </button>
                        )}

                        {role.status === "rejected" && (
                          <span className="text-xs text-red-500 font-medium">
                            Rejected
                          </span>
                        )}

                        {role.status === "revoked" && (
                          <span className="text-xs text-gray-500 font-medium">
                            Revoked
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {confirmAction && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Confirm Action
            </h3>

            <p className="text-gray-600 mb-6">
              Are you sure you want to{" "}
              <span className="font-semibold">{confirmAction.type}</span> the
              role <strong>{confirmAction.role}</strong> for{" "}
              <strong>{confirmAction.user}</strong>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  if (confirmAction.type === "approve") {
                    onApprove(confirmAction.roleId);
                  }

                  if (confirmAction.type === "reject") {
                    onReject(confirmAction.roleId);
                  }

                  if (confirmAction.type === "revoke") {
                    onRevoke(confirmAction.roleId);
                  }

                  setConfirmAction(null);
                }}
                className={`px-4 py-2 rounded-lg text-white ${
                  confirmAction.type === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : confirmAction.type === "reject"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-gray-700 hover:bg-gray-900"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleRequestTable;
