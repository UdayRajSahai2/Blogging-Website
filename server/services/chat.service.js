import Conversation from "../models/chat/conversation.js";
import Message from "../models/chat/message.js";
import MessageSeen from "../models/chat/messageSeen.js";
import User from "../models/user/User.js";
import ConversationParticipant from "../models/chat/conversationParticipant.js";
import sequelize from "../config/db.config.js";
import { Op } from "sequelize";
import UserConnection from "../models/user/UserConnection.js";

// =============================
// CREATE CONVERSATION
// =============================
export const createConversationService = async ({
  creatorId,
  userIds,
  isGroup = false,
  groupName = null,
}) => {
  //  FRIEND VALIDATION
  const connections = await UserConnection.findAll({
    where: {
      status: "accepted",
      [Op.or]: [{ sender_id: creatorId }, { receiver_id: creatorId }],
    },
  });

  const friendIds = connections.map((c) =>
    c.sender_id === creatorId ? c.receiver_id : c.sender_id,
  );

  for (let id of userIds) {
    if (!friendIds.includes(id)) {
      throw new Error("Only friends can be added");
    }
  }

  // prevent duplicate 1-1 chat
  if (!isGroup && userIds.length === 1) {
    const otherUserId = userIds[0];

    const existing = await Conversation.findOne({
      where: { is_group: false },
      include: [
        {
          model: ConversationParticipant,
          as: "participants",
          where: {
            user_id: { [Op.in]: [creatorId, otherUserId] },
          },
        },
      ],
    });

    if (existing) return existing;
  }

  if (isGroup && userIds.length < 2) {
    throw new Error("Group must have at least 3 users");
  }

  return await sequelize.transaction(async (t) => {
    const conversation = await Conversation.create(
      {
        is_group: isGroup,
        group_name: groupName,
        created_by: creatorId,
      },
      { transaction: t },
    );

    const participants = [...new Set([...userIds, creatorId])];

    await ConversationParticipant.bulkCreate(
      participants.map((id) => ({
        conversation_id: conversation.conversation_id,
        user_id: id,
        role: id === creatorId ? "admin" : "member",
      })),
      { transaction: t },
    );

    return conversation;
  });
};

// =============================
// SEND MESSAGE
// =============================
export const sendMessageService = async ({
  senderId,
  conversationId,
  content,
  messageType = "text",
  fileUrl = null,
}) => {
  //  membership check
  const participant = await ConversationParticipant.findOne({
    where: {
      conversation_id: conversationId,
      user_id: senderId,
    },
  });

  if (!participant) throw new Error("Unauthorized");

  return await sequelize.transaction(async (t) => {
    //  create message
    const message = await Message.create(
      {
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        message_type: messageType,
        file_url: fileUrl,
      },
      { transaction: t },
    );

    //  mark sender as seen
    await MessageSeen.create(
      {
        message_id: message.message_id,
        user_id: senderId,
      },
      { transaction: t },
    );

    //  increment unread for others
    await ConversationParticipant.increment(
      { unread_count: 1 },
      {
        where: {
          conversation_id: conversationId,
          user_id: { [Op.ne]: senderId },
        },
        transaction: t,
      },
    );

    //  update last message reference
    await Conversation.update(
      {
        last_message_id: message.message_id,
      },
      {
        where: { conversation_id: conversationId },
        transaction: t,
      },
    );

    // return populated message
    const fullMessage = await Message.findByPk(message.message_id, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["user_id", "fullname", "profile_img"],
        },
        {
          model: MessageSeen,
          as: "seenUsers",
          attributes: ["user_id"],
        },
      ],
      transaction: t, //  VERY IMPORTANT
    });

    return fullMessage || message;
  });
};

// =============================
// GET USER CONVERSATIONS
// =============================
export const getUserConversations = async (userId) => {
  return await ConversationParticipant.findAll({
    where: { user_id: userId },
    include: [
      {
        model: Conversation,
        include: [
          {
            model: Message,
            as: "lastMessage",
            required: false,
          },
          {
            model: ConversationParticipant,
            as: "participants",
            include: [
              {
                model: User,
                as: "user",
                attributes: ["user_id", "fullname", "profile_img"],
              },
            ],
          },
        ],
      },
    ],
    order: [[Conversation, "updatedAt", "DESC"]],
  });
};

// =============================
// GET MESSAGES (CURSOR BASED)
// =============================
export const getMessages = async ({
  conversationId,
  userId,
  limit = 20,
  cursor,
}) => {
  const participant = await ConversationParticipant.findOne({
    where: {
      conversation_id: conversationId,
      user_id: userId,
    },
  });

  if (!participant) throw new Error("Unauthorized");

  const where = { conversation_id: conversationId };

  if (cursor) {
    where.createdAt = { [Op.lt]: cursor }; //  cursor pagination
  }

  return await Message.findAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    include: [
      {
        model: User,
        as: "sender",
        attributes: ["user_id", "fullname", "profile_img"],
      },
      {
        model: MessageSeen,
        as: "seenUsers",
        attributes: ["user_id"],
      },
    ],
  });
};

// =============================
// MARK MESSAGES AS SEEN
// =============================
export const markMessagesSeen = async (conversationId, userId) => {
  const messages = await Message.findAll({
    where: {
      conversation_id: conversationId,
      sender_id: { [Op.ne]: userId },
    },
    attributes: ["message_id"],
  });

  const seenEntries = messages.map((msg) => ({
    message_id: msg.message_id,
    user_id: userId,
  }));

  await MessageSeen.bulkCreate(seenEntries, {
    ignoreDuplicates: true,
  });

  await ConversationParticipant.update(
    {
      unread_count: 0,
      last_read_message_id: messages.at(-1)?.message_id || null,
    },
    {
      where: {
        conversation_id: conversationId,
        user_id: userId,
      },
    },
  );
};

// =============================
// ADD MEMBER
// =============================
export const addMemberService = async (conversationId, adminId, newUserId) => {
  const admin = await ConversationParticipant.findOne({
    where: {
      conversation_id: conversationId,
      user_id: adminId,
    },
  });

  if (!admin || admin.role !== "admin") {
    throw new Error("Only admin can add members");
  }

  return await ConversationParticipant.create({
    conversation_id: conversationId,
    user_id: newUserId,
    role: "member",
  });
};

// =============================
// REMOVE MEMBER
// =============================
export const removeMemberService = async (
  conversationId,
  adminId,
  targetUserId,
) => {
  const admin = await ConversationParticipant.findOne({
    where: {
      conversation_id: conversationId,
      user_id: adminId,
    },
  });

  if (!admin || admin.role !== "admin") {
    throw new Error("Only admin can remove members");
  }

  await ConversationParticipant.destroy({
    where: {
      conversation_id: conversationId,
      user_id: targetUserId,
    },
  });

  return true;
};

// =============================
// LEAVE GROUP
// =============================
export const leaveGroupService = async (conversationId, userId) => {
  await ConversationParticipant.destroy({
    where: {
      conversation_id: conversationId,
      user_id: userId,
    },
  });

  return true;
};

// =============================
// UPDATE ROLE
// =============================
export const updateRoleService = async (
  conversationId,
  adminId,
  targetUserId,
  role,
) => {
  const admin = await ConversationParticipant.findOne({
    where: {
      conversation_id: conversationId,
      user_id: adminId,
    },
  });

  if (!admin || admin.role !== "admin") {
    throw new Error("Only admin allowed");
  }

  await ConversationParticipant.update(
    { role },
    {
      where: {
        conversation_id: conversationId,
        user_id: targetUserId,
      },
    },
  );

  return true;
};
export const deleteConversationService = async (conversationId, userId) => {
  // check if user is part of conversation
  const participant = await ConversationParticipant.findOne({
    where: {
      conversation_id: conversationId,
      user_id: userId,
    },
  });

  if (!participant) {
    throw new Error("Unauthorized");
  }

  // remove user from conversation (soft delete)
  await ConversationParticipant.destroy({
    where: {
      conversation_id: conversationId,
      user_id: userId,
    },
  });

  return true;
};
