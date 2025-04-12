import User from "./User.js";
import Blog from "./Blog.js";
import Comment from "./Comment.js";
import Like from "./Like.js"; // Add this at the top
import Read from "./Read.js";
import Notification from "./Notification.js";
import Profession from "./Professions.js";

// Define associations for User
User.associate = (models) => {
    User.hasMany(models.Blog, { foreignKey: "author", as: "userBlogs" });
    User.hasMany(models.Comment, { foreignKey: "commented_by", as: "comments" });
    User.hasMany(models.Notification, { foreignKey: "notification_for", as: "notifications" });
    User.belongsTo(models.Profession, { foreignKey: "profession_id", as: "profession" });
};

// Define associations for Blog
Blog.associate = (models) => {
    Blog.belongsTo(models.User, { foreignKey: "author", as: "blogAuthor" });
    Blog.hasMany(models.Comment, { foreignKey: "blog_id", as: "comments" });
    Blog.hasMany(models.Notification, { foreignKey: "blog", as: "notifications" });
};

Like.associate = (models) => {
    Like.belongsTo(models.Blog, { foreignKey: "blog_id" });
    Like.belongsTo(models.User, { foreignKey: "user_id" });
};

// Define associations for Comment
Comment.associate = (models) => {
    Comment.belongsTo(models.User, { foreignKey: "commented_by", as: "commentedBy" });
    Comment.belongsTo(models.Blog, { foreignKey: "blog_id", as: "blog" });
    Comment.belongsTo(models.Comment, { foreignKey: "parent", as: "parentComment" });
    Comment.hasMany(models.Comment, { foreignKey: "parent", as: "replies" });
};

// Define associations for Notification
Notification.associate = (models) => {
    Notification.belongsTo(models.User, { foreignKey: "notification_for", as: "notificationFor" });
    Notification.belongsTo(models.Blog, { foreignKey: "blog_id", as: "notificationBlog" });
    Notification.belongsTo(models.Comment, { foreignKey: "comment_id", as: "notificationComment" });
    Notification.belongsTo(models.User, { foreignKey: "user", as: "notificationUser" });
};

// Define associations for Read
Read.associate = (models) => {
    Read.belongsTo(models.Blog, { foreignKey: "blog_id" });
    Read.belongsTo(models.User, { foreignKey: "user_id" });
};

// Define associations for Profession
Profession.associate = (models) => {
    Profession.hasMany(models.User, { foreignKey: "profession_id", as: "users" });
    Profession.belongsTo(models.Profession, { foreignKey: "parent_id", as: "parentProfession" });
    Profession.hasMany(models.Profession, { foreignKey: "parent_id", as: "childProfessions" });
};

// Function to set up all associations
const setupAssociations = (models) => {
    User.associate(models);
    Blog.associate(models);
    Like.associate(models);
    Read.associate(models);
    Comment.associate(models);
    Notification.associate(models);
    Profession.associate(models);
  };


console.log("User associations:", User.associations);
console.log("Blog associations:", Blog.associations);
console.log("Like associations", Like.associations)
console.log("Read associations", Read.associations)
console.log("Comment associations:", Comment.associations);
console.log("Notification associations:", Notification.associations);
console.log("Profession associations:", Profession.associations);

export { User, Blog,Like, Comment,Read, Notification, Profession,setupAssociations  };