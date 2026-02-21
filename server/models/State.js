import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const State = sequelize.define(
  "State",
  {
    state_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    state_code: {
      type: DataTypes.STRING(2),
      allowNull: false,
      comment: "2-digit state code (e.g., '29' for Karnataka)",
    },
    state_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Full state name (e.g., 'KARNATAKA')",
    },
    country_code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      comment: "Reference to country code (e.g., 'IND')",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Whether this state is active in the system",
    },
  },
  {
    tableName: "states",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["state_code", "country_code"],
      },
      {
        fields: ["state_name"],
      },
      {
        fields: ["country_code"],
      },
      {
        fields: ["is_active"],
      },
    ],
  },
);

export default State;
