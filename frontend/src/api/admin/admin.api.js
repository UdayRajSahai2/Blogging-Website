//frontend\src\api\admin\admin.api.js
import apiClient from "../../services/apiClient";

/* =========================
    ENROLLMENTS
========================= */

export const getEnrollments = async (params = {}) => {
  const { data } = await apiClient.get("/api/admin/enrollments", {
    params,
  });

  return data;
};
/* =========================
   USER APPROVALS
========================= */

// Get users by status (pending/approved/rejected)
export const getUsersByApprovalStatus = async (status = "pending") => {
  const { data } = await apiClient.get("/api/admin/users/approval", {
    params: { status },
  });

  return data;
};

// Update approval status
export const updateUserApprovalStatus = async (userId, status) => {
  const { data } = await apiClient.put(`/api/admin/users/${userId}/approval`, {
    status,
  });

  return data;
};
