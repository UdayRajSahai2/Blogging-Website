import { DataTypes } from "sequelize";
import sequelize from "../../config/db.config.js";

const UserConnection = sequelize.define(
  "UserConnection",
  {
    connection_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "user_connections",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["sender_id", "receiver_id"], // prevent duplicate requests
      },
    ],
  },
);

export default UserConnection;
