// models/role.model.js

import { DataTypes } from "sequelize";
import sequelize from "../../config/db.config.js";

const Role = sequelize.define(
  "Role",
  {
    role_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    role_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "roles",
    timestamps: true,
    indexes: [{ unique: true, fields: ["role_name"] }],
  },
);

export default Role;
