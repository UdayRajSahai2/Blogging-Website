// src/config/api.config.js

const RAW_BASE_URL = import.meta.env.VITE_SERVER_DOMAIN || "";

export const BASE_URL = RAW_BASE_URL.replace(/\/$/, "");
