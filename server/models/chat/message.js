import { DataTypes } from "sequelize";
import sequelize from "../../config/db.config.js";

const Message = sequelize.define(
  "Message",
  {
    message_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: "CASCADE",
    },

    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // ✅ renamed from message → content
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    message_type: {
      type: DataTypes.ENUM("text", "image", "file"),
      defaultValue: "text",
    },

    // ✅ new fields for files/media
    file_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },

    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    edited_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "messages",
    timestamps: true,

    indexes: [
      { fields: ["conversation_id", "createdAt"] }, // 🔥 pagination
      { fields: ["sender_id"] },
    ],
  },
);

export default Message;
