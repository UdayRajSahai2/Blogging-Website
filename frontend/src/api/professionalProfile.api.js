// frontend/src/api/professionalProfile.api.js

import apiClient from "../services/apiClient";

// Get my professional profile
export const getProfessionalProfile = () =>
  apiClient.get("/api/professional-profile");

// Get single experience
export const getExperienceById = (id) =>
  apiClient.get(`/api/professional-profile/experience/${id}`);

// Add experience
export const addExperience = (data) =>
  apiClient.post("/api/professional-profile/experience", data);

// Update experience
export const updateExperience = (id, data) =>
  apiClient.put(`/api/professional-profile/experience/${id}`, data);

// Delete experience
export const deleteExperience = (id) =>
  apiClient.delete(`/api/professional-profile/experience/${id}`);

// Public profile
export const getProfessionalProfileByUser = (userId) =>
  apiClient.get(`/api/professional-profile/${userId}`);
