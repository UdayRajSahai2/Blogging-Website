import Conversation from "../chat/conversation.js";
import Message from "../chat/message.js";
import User from "../user/User.js";
import ConversationParticipant from "../chat/conversationParticipant.js";
import MessageSeen from "../chat/messageSeen.js";

const setupChatAssociations = () => {
  console.log("💬 Chat associations...");

  // ================= Conversation ↔ Participants =================
  Conversation.hasMany(ConversationParticipant, {
    foreignKey: "conversation_id",
    as: "participants",
    constraints: false,
  });

  ConversationParticipant.belongsTo(Conversation, {
    foreignKey: "conversation_id",
    constraints: false,
  });

  ConversationParticipant.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
    constraints: false,
  });

  User.hasMany(ConversationParticipant, {
    foreignKey: "user_id",
    constraints: false,
  });

  // ================= Conversation ↔ Messages =================
  Conversation.hasMany(Message, {
    foreignKey: "conversation_id",
    as: "messages",
    constraints: false,
  });

  Message.belongsTo(Conversation, {
    foreignKey: "conversation_id",
    as: "conversation",
    constraints: false,
  });

  // ⚠️ Important: last_message relation (keep but no constraint duplication)
  Conversation.belongsTo(Message, {
    foreignKey: "last_message_id",
    as: "lastMessage",
    constraints: false,
  });

  // ================= Message ↔ Sender =================
  Message.belongsTo(User, {
    foreignKey: "sender_id",
    as: "sender",
    constraints: false,
  });

  User.hasMany(Message, {
    foreignKey: "sender_id",
    as: "sentMessages",
    constraints: false,
  });

  // ================= Message Seen =================
  Message.hasMany(MessageSeen, {
    foreignKey: "message_id",
    as: "seenUsers",
    constraints: false,
  });

  MessageSeen.belongsTo(Message, {
    foreignKey: "message_id",
    constraints: false,
  });

  MessageSeen.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
    constraints: false,
  });

  console.log("✅ Chat associations ready");
};

export default setupChatAssociations;
