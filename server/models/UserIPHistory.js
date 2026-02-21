import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const UserIPHistory = sequelize.define(
  "UserIPHistory",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
      onDelete: "CASCADE",
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "user_ip_history",
    timestamps: false,
    indexes: [{ fields: ["user_id"] }, { fields: ["ip_address"] }],
  },
);

export default UserIPHistory;
