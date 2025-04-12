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
    },
    user: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    comment_id: {
        type: DataTypes.INTEGER, // Can be null if it's a like
    },
    reply: {
        type: DataTypes.INTEGER, // Can be null if it's not a reply
    },
    replied_on_comment: {
        type: DataTypes.INTEGER,
    },
    seen: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    timestamps: true,
});


export default Notification;
