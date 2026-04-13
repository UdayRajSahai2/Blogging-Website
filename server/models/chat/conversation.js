import { DataTypes } from "sequelize";
import sequelize from "../../config/db.config.js";

const Conversation = sequelize.define(
  "Conversation",
  {
    conversation_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    is_group: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    group_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    group_avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // ✅ FIX: avoid duplication
    last_message_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "conversations",
    timestamps: true,

    indexes: [{ fields: ["created_by"] }, { fields: ["last_message_id"] }],

    validate: {
      groupNameRequired() {
        if (this.is_group && !this.group_name) {
          throw new Error("Group name required for group conversations");
        }
      },
    },
  },
);

export default Conversation;
