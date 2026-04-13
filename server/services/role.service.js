import axios from "axios";
import { ROLE_API } from "../common/api"; // your BASE URL

// 🔐 attach token automatically
const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ➕ Add role
export const addRole = async (data) => {
  const res = await axios.post(`${ROLE_API}/add`, data, getAuthHeaders());

  return res.data; // ✅ return clean data
};

// 👤 Get my roles
export const getMyRoles = async () => {
  const res = await axios.get(`${ROLE_API}/me`, getAuthHeaders());

  return res.data; // ✅ IMPORTANT
};
