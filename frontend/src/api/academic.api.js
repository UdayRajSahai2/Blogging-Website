// frontend/src/api/academic.api.js

import axios from "axios";
import { lookInSession } from "../common/session";

const RAW_BASE_URL = import.meta.env.VITE_SERVER_DOMAIN;

if (!RAW_BASE_URL) {
  throw new Error("❌ VITE_SERVER_DOMAIN is missing in environment variables");
}

// remove trailing slash safely
const BASE_URL = RAW_BASE_URL.replace(/\/$/, "");

/* ======================================================
   Axios Instance
====================================================== */

const API = axios.create({
  baseURL: `${BASE_URL}/api/academics`,
  timeout: 10000, // 10s safety timeout
});

/* ======================================================
   Attach JWT Token
====================================================== */

API.interceptors.request.use(
  (config) => {
    const user = lookInSession("user");
    const token = user?.access_token;

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/* ======================================================
   Global Error Handling
====================================================== */

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized request. Token may be expired.");
    }

    return Promise.reject(error);
  },
);

/* ======================================================
   Academic API
====================================================== */

// Get all academics
export const getMyAcademics = () => API.get("/");

// Get single academic
export const getAcademicById = (id) => API.get(`/${id}`);

// Create academic
export const addAcademic = (data) => API.post("/", data);

// Update academic
export const updateAcademic = (id, data) => API.put(`/${id}`, data);

// Delete academic
export const deleteAcademic = (id) => API.delete(`/${id}`);
