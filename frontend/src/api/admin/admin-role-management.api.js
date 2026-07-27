import apiClient from "../../services/apiClient";

export const getRoleRequests = async () => {
  const { data } = await apiClient.get("/api/admin/roles");
  return data.data || [];
};

export const approveRoleRequest = async (userRoleId) => {
  const { data } = await apiClient.patch(
    `/api/admin/roles/${userRoleId}/approve`,
  );
  return data;
};

export const rejectRoleRequest = async (userRoleId) => {
  const { data } = await apiClient.patch(
    `/api/admin/roles/${userRoleId}/reject`,
  );
  return data;
};

export const revokeRoleRequest = async (userRoleId) => {
  const { data } = await apiClient.patch(
    `/api/admin/roles/${userRoleId}/revoke`,
  );
  return data;
};
