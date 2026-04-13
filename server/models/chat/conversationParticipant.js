import { DataTypes } from "sequelize";
import sequelize from "../../config/db.config.js";

const ConversationParticipant = sequelize.define(
  "ConversationParticipant",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    role: {
      type: DataTypes.ENUM("admin", "member"),
      defaultValue: "member",
    },

    unread_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    last_read_message_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "conversation_participants",
    timestamps: true,

    indexes: [
      { unique: true, fields: ["conversation_id", "user_id"] },
      { fields: ["user_id"] },
      { fields: ["conversation_id"] },
    ],
  },
);

export default ConversationParticipant;
