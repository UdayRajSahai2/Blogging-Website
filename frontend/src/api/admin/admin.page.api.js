//frontend\src\api\admin.page.api.js
import apiClient from "../../services/apiClient";

export const getAdminPages = async () => {
  return apiClient.get("/api/admin/pages");
};

export const getAdminPageById = async (id) => {
  return apiClient.get(`/api/admin/pages/${id}`);
};

export const createAdminPage = async (data) => {
  return apiClient.post("/api/admin/pages", data);
};

export const updateAdminPage = async (id, data) => {
  return apiClient.put(`/api/admin/pages/${id}`, data);
};
