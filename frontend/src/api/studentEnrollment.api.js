import apiClient from "../services/apiClient";

// Create student enrollment
export const createStudentEnrollment = (data) =>
  apiClient.post("/api/student-enrollment/create", data);

// Get enrollment by user
export const getStudentEnrollmentByUser = (userId) =>
  apiClient.get(`/api/student-enrollment/user/${userId}`);
