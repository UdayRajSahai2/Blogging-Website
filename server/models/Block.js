import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const Block = sequelize.define(
  "Block",
  {
    block_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    block_code: {
      type: DataTypes.STRING(6),
      allowNull: false,
      comment: "6-digit block code (e.g., '290101' for Bangalore North)",
    },
    block_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Block name (null for urban areas)",
    },
    sub_district_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Sub-district/Zone/Ward name (for urban areas)",
    },
    district_code: {
      type: DataTypes.STRING(4),
      allowNull: false,
      comment: "Reference to district code",
    },
    state_code: {
      type: DataTypes.STRING(2),
      allowNull: false,
      comment: "Reference to state code",
    },
    country_code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      comment: "Reference to country code",
    },
    is_urban: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment:
        "Whether this is an urban area (has sub_district_name instead of block_name)",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Whether this block is active in the system",
    },
  },
  {
    tableName: "blocks",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["block_code", "district_code", "state_code", "country_code"],
      },
      {
        fields: ["block_name"],
      },
      {
        fields: ["sub_district_name"],
      },
      {
        fields: ["district_code", "state_code", "country_code"],
      },
      {
        fields: ["is_urban"],
      },
      {
        fields: ["is_active"],
      },
    ],
  },
);

export default Block;
