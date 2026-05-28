import { DataTypes } from "sequelize";
import sequelize from "../../config/db.config.js";

const Blog = sequelize.define(
  "Blog",
  {
    blog_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    banner: {
      type: DataTypes.STRING,
    },
    des: {
      type: DataTypes.STRING(200),
    },
    content: {
      type: DataTypes.JSON, // Since content is an array
    },
    tags: {
      type: DataTypes.JSON, // Array of strings
    },
    author: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users", // Name of the referenced table (case-sensitive)
        key: "user_id", // Name of the referenced column
      },
    },
    draft: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    publishedAt: {
      type: DataTypes.DATE, // Add this field
      allowNull: true, // Allow null if the blog is a draft
    },
    // ADD THESE (Admin  moderation)

    status: {
      type: DataTypes.ENUM("draft", "pending", "published", "rejected"),
      defaultValue: "draft",
      allowNull: false,
    },

    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    review_note: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    reviewed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    taxonomy_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    deletedAt: "deleted_at", // optional custom column
    indexes: [
      { fields: ["status"] },
      { fields: ["is_deleted"] },
      { fields: ["author"] },
      { fields: ["draft"] },
    ],
  },
);

export default Blog;
