import apiClient from "../../services/apiClient";

/* =========================
   STUDENT ENROLLMENTS
========================= */

export const getStudentEnrollments = async (params = {}) => {
  const { data } = await apiClient.get("/api/admin/student-enrollments", {
    params,
  });

  return data;
};
