import {
  sendMessageService,
  getUserConversations,
  getMessages,
  createConversationService,
  addMemberService,
  removeMemberService,
  leaveGroupService,
  updateRoleService,
  deleteConversationService,
} from "../services/chat.service.js";

// ================= SEND MESSAGE =================
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, messageType, fileUrl } = req.body;

    if (!conversationId) {
      return res.status(400).json({ error: "conversationId is required" });
    }

    if (!content && !fileUrl) {
      return res.status(400).json({
        error: "Message content or file is required",
      });
    }

    const data = await sendMessageService({
      senderId: req.user.id,
      conversationId,
      content,
      messageType,
      fileUrl,
    });

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Send message error:", err);
    return res.status(500).json({
      error: err.message || "Failed to send message",
    });
  }
};

// ================= CREATE CONVERSATION =================
export const createConversation = async (req, res) => {
  try {
    const { userIds, isGroup = false, groupName } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res
        .status(400)
        .json({ error: "userIds must be a non-empty array" });
    }

    if (isGroup && !groupName) {
      return res.status(400).json({
        error: "Group name is required for group conversations",
      });
    }

    const convo = await createConversationService({
      creatorId: req.user.id,
      userIds,
      isGroup,
      groupName,
    });

    return res.status(201).json({
      success: true,
      data: convo,
    });
  } catch (err) {
    console.error("Create conversation error:", err);
    return res.status(500).json({
      error: err.message || "Failed to create conversation",
    });
  }
};

// ================= GET USER CONVERSATIONS =================
export const getConversations = async (req, res) => {
  try {
    const data = await getUserConversations(req.user.id);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Fetch conversations error:", err);
    return res.status(500).json({
      error: "Failed to fetch conversations",
    });
  }
};

// ================= GET MESSAGES (CURSOR PAGINATION) =================
export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { cursor, limit = 20 } = req.query;

    if (!conversationId) {
      return res.status(400).json({ error: "conversationId is required" });
    }

    const data = await getMessages({
      conversationId,
      userId: req.user.id,
      limit: parseInt(limit),
      cursor, // createdAt or message_id
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Get messages error:", err);
    return res.status(500).json({
      error: err.message || "Failed to fetch messages",
    });
  }
};

// ================= ADD MEMBER =================
export const addMember = async (req, res) => {
  try {
    const { conversationId, userId } = req.body;

    if (!conversationId || !userId) {
      return res.status(400).json({
        error: "conversationId and userId are required",
      });
    }

    const data = await addMemberService(conversationId, req.user.id, userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Add member error:", err);
    return res.status(400).json({
      error: err.message,
    });
  }
};

// ================= REMOVE MEMBER =================
export const removeMember = async (req, res) => {
  try {
    const { conversationId, userId } = req.body;

    if (!conversationId || !userId) {
      return res.status(400).json({
        error: "conversationId and userId are required",
      });
    }

    await removeMemberService(conversationId, req.user.id, userId);

    return res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.error("Remove member error:", err);
    return res.status(400).json({
      error: err.message,
    });
  }
};

// ================= LEAVE GROUP =================
export const leaveGroup = async (req, res) => {
  try {
    const { conversationId } = req.body;

    if (!conversationId) {
      return res.status(400).json({
        error: "conversationId is required",
      });
    }

    await leaveGroupService(conversationId, req.user.id);

    return res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.error("Leave group error:", err);
    return res.status(400).json({
      error: err.message,
    });
  }
};

// ================= UPDATE ROLE =================
export const updateRole = async (req, res) => {
  try {
    const { conversationId, userId, role } = req.body;

    if (!conversationId || !userId || !role) {
      return res.status(400).json({
        error: "conversationId, userId, and role are required",
      });
    }

    await updateRoleService(conversationId, req.user.id, userId, role);

    return res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.error("Update role error:", err);
    return res.status(400).json({
      error: err.message,
    });
  }
};
export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    await deleteConversationService(conversationId, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Conversation deleted",
    });
  } catch (err) {
    console.error("Delete conversation error:", err);
    return res.status(400).json({
      error: err.message,
    });
  }
};
