import { DataTypes } from "sequelize";
import sequelize from "../../config/db.config.js";

const UserRole = sequelize.define(
  "UserRole",
  {
    user_role_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected", "revoked"),
      allowNull: false,
      defaultValue: "pending",
    },
    action_source: {
      type: DataTypes.ENUM("user", "admin"),
      allowNull: true,
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    requested_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    approved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    rejected_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "user_roles",
    timestamps: true,

    indexes: [
      { fields: ["user_id"] },
      { fields: ["role_id"] },
      { fields: ["status"] },
    ],
  },
);

export default UserRole;
