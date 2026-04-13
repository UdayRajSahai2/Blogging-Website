import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const Profession = sequelize.define(
  "Profession",
  {
    profession_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 3,
      },
      comment: "0=domain, 1=field, 2=group, 3=specialty",
    },

    code: {
      type: DataTypes.STRING(100), // or 100 for safety
      allowNull: true,
    },
  },
  {
    tableName: "Professions",

    timestamps: false,

    indexes: [
      {
        unique: true,
        fields: ["name", "parent_id"],
        name: "unique_profession_per_parent",
      },
      {
        fields: ["parent_id"],
      },
      {
        fields: ["level"],
      },
      {
        fields: ["code"],
      },
    ],
  },
);

export default Profession;
