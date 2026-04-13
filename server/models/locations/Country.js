import { DataTypes } from "sequelize";
import sequelize from "../../config/db.config.js";

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
      comment: "Numeric country code (e.g., 356 for India)",
    },
    country_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    country_abbr: {
      type: DataTypes.STRING(3),
      allowNull: false,
      comment: "ISO Alpha-3 code (e.g., IND)",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
  },
);

export default Country;
