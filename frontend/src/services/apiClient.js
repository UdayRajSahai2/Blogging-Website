// frontend\src\services\apiClient.js
//centralized Axios HTTP client with interceptors for auth and error handling for all API requests, authentication headers, and global error handling.
import axios from "axios";
import { lookInSession, removeFromSession } from "../common/session";
import { BASE_URL } from "../config/api.config";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* REQUEST INTERCEPTOR */
apiClient.interceptors.request.use(
  (config) => {
    const user = lookInSession("user");

    if (user?.access_token) {
      config.headers.Authorization = `Bearer ${user.access_token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/* RESPONSE INTERCEPTOR */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn("Session expired. Please login again.");
      removeFromSession("user");
      window.location.href = "/signin";
    }

    if (status === 403) console.warn("Access denied.");
    if (status === 500) console.error("Server error.");

    return Promise.reject(error);
  },
);

export default apiClient;
