import apiClient from "../services/apiClient";
import { ROLE_API } from "../common/api";

//  Request multiple roles
export const requestRoles = async (roles) => {
  const res = await apiClient.post(`${ROLE_API}/request-roles`, {
    roles,
  });
  return res.data;
};

//  Get approved roles
export const getMyRoles = async () => {
  const res = await apiClient.get(`${ROLE_API}/me`);
  return res.data.roles || [];
};
