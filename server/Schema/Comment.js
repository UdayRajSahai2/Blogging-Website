import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Comment = sequelize.define("Comment", {
    comment_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    blog_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
    },
    isReply: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    parent: {
        type: DataTypes.INTEGER, // Parent comment ID
    }
}, {
    timestamps: true,
});

export default Comment;
