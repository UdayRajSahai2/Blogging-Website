// frontend/src/api/academic.api.js
import apiClient from "../services/apiClient";

/* Academic API */

// Get all academics
export const getMyAcademics = () => apiClient.get("/api/academics");

// Get single academic
export const getAcademicById = (id) => apiClient.get(`/api/academics/${id}`);

// Create academic
export const addAcademic = (data) => apiClient.post("/api/academics", data);

// Update academic
export const updateAcademic = (id, data) =>
  apiClient.put(`/api/academics/${id}`, data);

// Delete academic
export const deleteAcademic = (id) => apiClient.delete(`/api/academics/${id}`);
