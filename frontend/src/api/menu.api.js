//frontend\src\api\menu.api.js
import apiClient from "../services/apiClient";
export const getMenu = () => apiClient.get("/api/menu");
