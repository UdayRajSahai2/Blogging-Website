import apiClient from "../services/apiClient";

export const getAvailableRoles = async () => {
  const { data } = await apiClient.get("/api/user-roles/available");
  return data.data;
};

export const getMyRoles = async () => {
  const { data } = await apiClient.get("/api/user-roles/my-roles");
  return data.data;
};

export const requestRole = async (role) => {
  const { data } = await apiClient.post("/api/user-roles/request", { role });
  return data;
};

export const setPrimaryRole = async (role) => {
  const { data } = await apiClient.patch("/api/user-roles/primary-role", {
    role,
  });
  return data;
};

export const withdrawRoleRequest = async (userRoleId) => {
  const { data } = await apiClient.delete(
    `/api/user-roles/request/${userRoleId}`,
  );
  return data;
};
