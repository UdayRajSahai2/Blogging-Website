//frontend\src\api\interests.api.js
import apiClient from "../services/apiClient";

/* =========================
   🌳 GET INTEREST TREE
========================= */
export const getInterestTree = async () => {
  const { data } = await apiClient.get(`/api/interests/tree`);
  return data;
};

/* =========================
   📋 GET ALL INTERESTS (FLAT)
========================= */
export const getAllInterests = async () => {
  const { data } = await apiClient.get(`/api/interests`);
  return data;
};

/* =========================
   👤 GET USER INTERESTS
========================= */
export const getUserInterests = async () => {
  const { data } = await apiClient.get(`/api/interests/user`);
  return data;
};

/* =========================
   ➕ ADD USER INTERESTS
========================= */
export const addUserInterests = async (interest_ids) => {
  const { data } = await apiClient.post(`/api/interests/user`, {
    interest_ids,
  });
  return data;
};

/* =========================
   🔁 REPLACE USER INTERESTS
========================= */
export const replaceUserInterests = async (interest_ids) => {
  const { data } = await apiClient.put(`/api/interests/user`, {
    interest_ids,
  });
  return data;
};

/* =========================
   ❌ REMOVE USER INTEREST
========================= */
export const removeUserInterest = async (id) => {
  const { data } = await apiClient.delete(`/api/interests/user/${id}`);
  return data;
};

/* =========================
   🛠️ ADMIN CREATE
========================= */
export const createInterest = async ({ name, parent_id = null }) => {
  const { data } = await apiClient.post(`/api/interests`, {
    name,
    parent_id,
  });
  return data;
};

/* =========================
   🛠️ ADMIN DELETE
========================= */
export const deleteInterest = async (id) => {
  const { data } = await apiClient.delete(`/api/interests/${id}`);
  return data;
};
