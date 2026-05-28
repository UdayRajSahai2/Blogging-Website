import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const Page = sequelize.define(
  "Page",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    path: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    sections: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },

    status: {
      type: DataTypes.ENUM("draft", "published"),
      defaultValue: "draft",
    },

    meta_title: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    meta_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "pages",
    timestamps: true,
  },
);

export default Page;
