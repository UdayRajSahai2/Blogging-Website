import UserConnection from "../models/user/UserConnection.js";
import User from "../models/user/User.js";
import { Op } from "sequelize";

// =============================
// SEND REQUEST
// =============================
export const sendConnectionRequest = async (senderId, receiverId) => {
  if (senderId === receiverId) {
    throw new Error("Cannot connect with yourself");
  }

  const existing = await UserConnection.findOne({
    where: {
      [Op.or]: [
        { sender_id: senderId, receiver_id: receiverId },
        { sender_id: receiverId, receiver_id: senderId },
      ],
    },
  });

  // =============================
  // HANDLE EXISTING
  // =============================
  if (existing) {
    // already connected
    if (existing.status === "accepted") {
      throw new Error("Already connected");
    }

    //  pending request exists
    if (existing.status === "pending") {
      // if OTHER user sent → auto accept
      if (existing.receiver_id === senderId) {
        existing.status = "accepted";
        await existing.save();
        return existing;
      }

      throw new Error("Request already pending");
    }

    // rejected → allow resend
    if (existing.status === "rejected") {
      existing.status = "pending";
      existing.sender_id = senderId;
      existing.receiver_id = receiverId;
      await existing.save();
      return existing;
    }
  }

  // =============================
  // CREATE NEW
  // =============================
  return await UserConnection.create({
    sender_id: senderId,
    receiver_id: receiverId,
  });
};

// =============================
// ACCEPT REQUEST
// =============================
export const acceptConnectionRequest = async (userId, connectionId) => {
  const connection = await UserConnection.findByPk(connectionId);

  if (!connection) throw new Error("Request not found");

  if (connection.receiver_id !== userId) {
    throw new Error("Unauthorized");
  }

  connection.status = "accepted";
  await connection.save();

  return connection;
};

// =============================
// REJECT REQUEST
// =============================
export const rejectConnectionRequest = async (userId, connectionId) => {
  const connection = await UserConnection.findByPk(connectionId);

  if (!connection) throw new Error("Request not found");

  if (connection.receiver_id !== userId) {
    throw new Error("Unauthorized");
  }

  connection.status = "rejected";
  await connection.save();

  return true;
};

// =============================
// GET FRIENDS (ACCEPTED)
// =============================
export const getConnections = async (userId) => {
  const connections = await UserConnection.findAll({
    where: {
      status: "accepted",
      [Op.or]: [{ sender_id: userId }, { receiver_id: userId }],
    },
    include: [
      {
        model: User,
        as: "sender",
        attributes: ["user_id", "fullname", "profile_img"],
      },
      {
        model: User,
        as: "receiver",
        attributes: ["user_id", "fullname", "profile_img"],
      },
    ],
  });

  return connections.map((c) => {
    const isSender = c.sender_id === userId;
    const user = isSender ? c.receiver : c.sender;

    return {
      ...user.toJSON(),
      connection_id: c.connection_id, //  REQUIRED
    };
  });
};

// =============================
// GET PENDING REQUESTS
// =============================
export const getPendingRequests = async (userId) => {
  return await UserConnection.findAll({
    where: {
      receiver_id: userId,
      status: "pending",
    },
    include: [
      {
        model: User,
        as: "sender",
        attributes: ["user_id", "fullname", "profile_img"],
      },
    ],
  });
};
export const removeConnection = async (userId, connectionId) => {
  const connection = await UserConnection.findByPk(connectionId);

  if (!connection) throw new Error("Connection not found");

  if (connection.sender_id !== userId && connection.receiver_id !== userId) {
    throw new Error("Unauthorized");
  }

  await connection.destroy();

  return true;
};

export const getSentRequests = async (userId) => {
  return await UserConnection.findAll({
    where: {
      sender_id: userId,
      status: "pending",
    },
    include: [
      {
        model: User,
        as: "receiver",
        attributes: ["user_id", "fullname", "profile_img"],
      },
    ],
  });
};
