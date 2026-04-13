import apiClient from "../services/apiClient";

// =============================
// SEND CONNECTION REQUEST
// =============================
export const sendConnectionRequestAPI = (userId) =>
  apiClient.post("/api/connections/send", { userId });

// =============================
// ACCEPT REQUEST
// =============================
export const acceptConnectionRequestAPI = (connectionId) =>
  apiClient.post("/api/connections/accept", { connectionId });

// =============================
// REJECT REQUEST
// =============================
export const rejectConnectionRequestAPI = (connectionId) =>
  apiClient.post("/api/connections/reject", { connectionId });

// =============================
// GET FRIENDS
// =============================
export const getFriendsAPI = () => apiClient.get("/api/connections/friends");

// =============================
// GET PENDING REQUESTS
// =============================
export const getPendingRequestsAPI = () =>
  apiClient.get("/api/connections/pending");

// =============================
// SEARCH FRIENDS (FOR GROUP)
// =============================
export const searchFriendsAPI = (query) =>
  apiClient.get("/api/connections/search", {
    params: { q: query },
  });
export const removeConnectionAPI = (connectionId) =>
  apiClient.delete(`/api/connections/remove/${connectionId}`);
export const getSentRequestsAPI = () => apiClient.get("/api/connections/sent");
