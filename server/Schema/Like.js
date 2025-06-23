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
      model: "Blogs",
      key: "blog_id",
    },
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "user_id",
    },
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['blog_id', 'user_id'],
      name: 'unique_like'
    }
  ]
});

export default Like;