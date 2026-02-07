import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Country = sequelize.define(
  "Country",
  {
    country_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    country_code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      unique: true,
      comment: "3-digit country code (e.g., 'IND' for India)",
    },
    country_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Full country name (e.g., 'India')",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Whether this country is active in the system",
    },
  },
  {
    tableName: "countries",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["country_code"],
      },
      {
        fields: ["country_name"],
      },
      {
        fields: ["is_active"],
      },
    ],
  }
);

export default Country; 