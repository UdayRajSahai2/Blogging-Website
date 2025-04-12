import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Comment = sequelize.define("Comment", {
    comment_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    blog_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: "Blogs", // Table name (case-sensitive)
            key: "blog_id", // Primary key in Blogs table
        },
    },
    blog_author: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    comment: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    children: {
        type: DataTypes.JSON, // Array of child comment IDs
    },
    commented_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Users", // Table name
            key: "user_id", // Primary key in Users table
        },
    },
    isReply: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    parent_comment_id: {
        type: DataTypes.STRING, // Parent comment ID
        references: {
            model: "Comments", // Self-reference
            key: "comment_id",
        },
    }
}, {
    timestamps: true,
});

export default Comment;
