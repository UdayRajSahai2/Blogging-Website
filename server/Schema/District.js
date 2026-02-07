import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const District = sequelize.define(
  "District",
  {
    district_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    district_code: {
      type: DataTypes.STRING(4),
      allowNull: false,
      comment: "4-digit district code (e.g., '2901' for Bangalore Urban)",
    },
    district_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Full district name (e.g., 'BANGALORE URBAN')",
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
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Whether this district is active in the system",
    },
  },
  {
    tableName: "districts",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["district_code", "state_code", "country_code"],
      },
      {
        fields: ["district_name"],
      },
      {
        fields: ["state_code", "country_code"],
      },
      {
        fields: ["is_active"],
      },
    ],
  }
);

export default District; 