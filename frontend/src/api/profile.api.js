import apiClient from "../services/apiClient";

/* =========================
   SIMILAR PROFILES API
========================= */
export const getSimilarProfiles = (userId) =>
  apiClient.get(`/api/profiles/similar-profiles?userId=${userId}`);
