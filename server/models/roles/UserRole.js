// models/userRole.model.js

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
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "user_roles",
    timestamps: true,
    indexes: [
      { fields: ["user_id"] },
      { fields: ["role_id"] },
      { unique: true, fields: ["user_id", "role_id"] },
    ],
  },
);

export default UserRole;
