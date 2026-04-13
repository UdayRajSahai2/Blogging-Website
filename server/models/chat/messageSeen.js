import { DataTypes } from "sequelize";
import sequelize from "../../config/db.config.js";

const MessageSeen = sequelize.define(
  "MessageSeen",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    message_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    seen_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "message_seen",
    timestamps: false,

    indexes: [
      { unique: true, fields: ["message_id", "user_id"] },
      { fields: ["user_id"] },
    ],
  },
);

export default MessageSeen;
