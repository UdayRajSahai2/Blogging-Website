//frontend\src\api\page.api.js
import apiClient from "../services/apiClient";

// Get page content by path
export const getPageByPath = (path) => apiClient.get(`/api/pages?path=${path}`);
