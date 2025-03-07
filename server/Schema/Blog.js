import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Blog = sequelize.define("Blog", {
    blog_id: {
        type: DataTypes.STRING,
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
    },
    activity: {
        type: DataTypes.JSON, // Store likes/comments as JSON
    },
    draft: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    timestamps: true,
});

export default Blog;
