import { DataTypes } from "sequelize";
import sequelize from "../../config/db.config.js";

const Interest = sequelize.define(
  "Interest",
  {
    interest_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // NULL = root category
      references: {
        model: "interests",
        key: "interest_id",
      },
      onDelete: "CASCADE",
    },

    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // 0=category, 1=sub, 2=sub-sub
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "interests",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["name", "parent_id"],
      },
      {
        fields: ["parent_id"],
      },
    ],
  },
);

export default Interest;
