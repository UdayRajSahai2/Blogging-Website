import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
  sendMessage,
  getConversations,
  getConversationMessages,
  createConversation,
  deleteConversation,
  addMember,
  removeMember,
  leaveGroup,
  updateRole,
} from "../controllers/chat.controller.js";

const router = express.Router();

//  Protect all routes
router.use(verifyJWT);

// =============================
// CONVERSATIONS
// =============================

//  Create conversation
router.post("/conversations", createConversation);

//  Get all conversations for user
router.get("/conversations", getConversations);

// =============================
// MESSAGES
// =============================

// Send message
router.post("/messages", sendMessage);

//  Get messages (with pagination)
router.get("/conversations/:conversationId/messages", getConversationMessages);

// DELETE conversation (leave or delete)
router.delete("/conversations/:conversationId", deleteConversation);

// =============================
// GROUP MANAGEMENT
// =============================

//  Add member
router.post("/conversations/:conversationId/members", addMember);

//  Remove member
router.delete("/conversations/:conversationId/members/:userId", removeMember);

//  Leave group
router.delete("/conversations/:conversationId/leave", leaveGroup);

//  Update role
router.patch("/conversations/:conversationId/members/:userId/role", updateRole);

export default router;
