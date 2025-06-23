import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Read = sequelize.define("Read", {
  read_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  blog_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: "Blogs",
      key: "blog_id",
    },
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "Users",
      key: "user_id",
    },
  },
}, {
  timestamps: true,
});

export default Read;