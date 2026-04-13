// frontend\src\api\chat.api.js
import apiClient from "../services/apiClient";

export const sendMessageAPI = (data) =>
  apiClient.post("/api/chat/messages", data);

export const getConversationsAPI = () =>
  apiClient.get("/api/chat/conversations");

export const getMessagesAPI = (conversationId, cursor, limit = 20) =>
  apiClient.get(`/api/chat/conversations/${conversationId}/messages`, {
    params: { cursor, limit },
  });

export const createConversationAPI = (data) =>
  apiClient.post("/api/chat/conversations", data);

export const deleteConversationAPI = (conversationId) =>
  apiClient.delete(`/api/chat/conversations/${conversationId}`);
