import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Village = sequelize.define(
  "Village",
  {
    village_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    village_code: {
      type: DataTypes.STRING(6),
      allowNull: false,
      comment: "6-digit village code (e.g., '290101001' for specific village)",
    },
    village_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Full village name",
    },
    block_code: {
      type: DataTypes.STRING(6),
      allowNull: false,
      comment: "Reference to block code",
    },
    sub_district_code: {
      type: DataTypes.STRING(6),
      allowNull: true,
      comment: "Reference to sub-district code (for urban areas)",
    },
    sub_district_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Sub-district name (for urban areas)",
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
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Whether this village is active in the system",
    },
  },
  {
    tableName: "villages",
    timestamps: true,
    indexes: [
      {
        unique: true,
        name: 'villages_vcode_bcode_dcode_scode_ccode',
        fields: ["village_code", "block_code", "district_code", "state_code", "country_code"],
      },
      {
        fields: ["village_name"],
      },
      {
        fields: ["block_code", "district_code", "state_code", "country_code"],
      },
      {
        fields: ["is_active"],
      },
    ],
  }
);

export default Village; 