import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Notification = sequelize.define("Notification", {
    type: {
        type: DataTypes.ENUM("like", "comment", "reply"),
        allowNull: false,
    },
    blog: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: "Blogs",
            key: "blog_id"
        }
    },
    notification_for: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Users",
            key: "user_id"
        }
    },
    user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Users", 
            key: "user_id"
        }
    },
    comment_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: "Comments",
            key: "comment_id"
        }
    },
    reply: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: "Comments",
            key: "comment_id"
        }
    },
    replied_on_comment: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: "Comments",
            key: "comment_id"
        }
    },
    seen: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    timestamps: true,
});

export default Notification;