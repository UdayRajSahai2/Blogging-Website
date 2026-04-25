import jwt from "jsonwebtoken";
import {
  sendMessageService,
  markMessagesSeen,
} from "../services/chat.service.js";

// 🔥 support multiple sockets per user
const onlineUsers = new Map(); // userId -> Set(socketIds)

export const initChatSocket = (io) => {
  // =============================
  // 🔐 AUTH MIDDLEWARE
  // =============================
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) return next(new Error("Unauthorized"));

      const decoded = jwt.verify(token, process.env.SECRET_ACCESS_KEY);
      socket.user = {
        id: decoded.user_id,
      };

      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  // =============================
  // 🔌 CONNECTION
  // =============================
  io.on("connection", (socket) => {
    const userId = socket.user.id;
    console.log("⚡ Connected:", userId);

    // ✅ store multiple sockets per user
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // join personal room
    socket.join(`user_${userId}`);

    // broadcast online users
    io.emit("online_users", Array.from(onlineUsers.keys()));

    // =============================
    // 📥 JOIN CONVERSATION
    // =============================
    socket.on("join_conversation", ({ conversationId }) => {
      if (!conversationId) return;

      socket.join(`conversation_${conversationId}`);
    });

    // =============================
    // 📤 SEND MESSAGE
    // =============================
    socket.on("send_message", async (payload, callback) => {
      try {
        const { conversationId, content, messageType, fileUrl } = payload;

        if (!conversationId) {
          return callback?.({ error: "conversationId required" });
        }

        const msg = await sendMessageService({
          senderId: userId,
          conversationId,
          content,
          messageType,
          fileUrl,
        });

        // 🔥 send actual message (not just refresh)
        io.to(`conversation_${conversationId}`).emit("new_message", msg);

        // 🔥 notify ALL participants (not just room)
        io.emit("conversation_updated", {
          conversationId,
        });

        callback?.({ success: true, data: msg });
      } catch (err) {
        console.error("Send message error:", err);
        callback?.({ error: err.message });
      }
    });

    // =============================
    // ✍️ TYPING START
    // =============================
    socket.on("typing_start", ({ conversationId }) => {
      socket.to(`conversation_${conversationId}`).emit("typing_start", {
        userId,
      });
    });

    // =============================
    // ✍️ TYPING STOP
    // =============================
    socket.on("typing_stop", ({ conversationId }) => {
      socket.to(`conversation_${conversationId}`).emit("typing_stop", {
        userId,
      });
    });

    // =============================
    // 👀 MARK AS SEEN
    // =============================
    socket.on("mark_seen", async ({ conversationId }, callback) => {
      try {
        await markMessagesSeen(conversationId, userId);

        io.to(`conversation_${conversationId}`).emit("messages_seen", {
          conversationId,
          userId,
        });

        callback?.({ success: true });
      } catch (err) {
        callback?.({ error: err.message });
      }
    });

    // =============================
    // 🔔 NEW MESSAGE NOTIFICATION
    // =============================
    socket.on("notify_new_message", ({ conversationId }) => {
      socket.to(`conversation_${conversationId}`).emit("refresh_conversations");
    });

    // =============================
    // ❌ DISCONNECT
    // =============================
    socket.on("disconnect", () => {
      console.log("❌ Disconnected:", userId);

      if (onlineUsers.has(userId)) {
        onlineUsers.get(userId).delete(socket.id);

        // remove user if no active sockets
        if (onlineUsers.get(userId).size === 0) {
          onlineUsers.delete(userId);
        }
      }

      io.emit("online_users", Array.from(onlineUsers.keys()));
    });
  });
};
