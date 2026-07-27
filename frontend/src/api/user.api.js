//frontend\src\api\user.api.js
import apiClient from "../services/apiClient";

// Create enrollment
export const createEnrollment = (data) =>
  apiClient.post("/api/enrollment/create", data);

// Get enrollment by user
export const getEnrollmentByUser = (userId) =>
  apiClient.get(`/api/enrollment/user/${userId}`);
