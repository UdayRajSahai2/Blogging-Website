import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Like = sequelize.define("Like", {
  like_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  blog_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: "Blogs", // References the Blog table
      key: "blog_id",
    },
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users", // References the User table
      key: "user_id",
    },
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

export default Like;