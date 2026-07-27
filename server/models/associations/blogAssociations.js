import User from "../../models/user/User.js";
import Blog from "../blog/Blog.js";
import Comment from "../blog/Comment.js";
import Like from "../blog/Like.js";
import Read from "../blog/Read.js";
import Notification from "../blog/Notification.js";
import BlogTaxonomy from "../blog/BlogTaxonomy.js";
const setupBlogAssociations = () => {
  // ================= BLOG =================
  Blog.belongsTo(User, {
    foreignKey: "author",
    targetKey: "user_id",
    as: "blogAuthor",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  Blog.hasMany(Comment, {
    sourceKey: "blog_id",
    foreignKey: "blog_id",
    as: "comments",
    onDelete: "CASCADE",
  });

  Blog.hasMany(Notification, {
    sourceKey: "blog_id",
    foreignKey: "blog",
    as: "notifications",
  });

  Blog.hasMany(Like, {
    sourceKey: "blog_id",
    foreignKey: "blog_id",
    as: "likes",
    onDelete: "CASCADE",
  });

  Blog.hasMany(Read, {
    sourceKey: "blog_id",
    foreignKey: "blog_id",
    as: "reads",
    onDelete: "CASCADE",
  });

  // ================= LIKE =================
  Like.belongsTo(Blog, {
    targetKey: "blog_id",
    foreignKey: "blog_id",
    as: "blog",
  });

  Like.belongsTo(User, {
    targetKey: "user_id",
    foreignKey: "user_id",
    as: "user",
  });

  // ================= COMMENT =================
  Comment.belongsTo(User, {
    targetKey: "user_id",
    foreignKey: "commented_by",
    as: "commentedBy",
  });

  Comment.belongsTo(Blog, {
    targetKey: "blog_id",
    foreignKey: "blog_id",
    as: "blog",
  });

  Comment.belongsTo(Comment, {
    foreignKey: "parent_comment_id",
    as: "parentComment",
  });

  Comment.hasMany(Comment, {
    foreignKey: "parent_comment_id",
    as: "replies",
    onDelete: "CASCADE",
  });

  Comment.hasMany(Notification, {
    foreignKey: "comment_id",
    as: "commentNotifications",
  });

  // ================= NOTIFICATION =================
  Notification.belongsTo(User, {
    foreignKey: "notification_for",
    targetKey: "user_id",
    as: "notificationFor",
  });

  Notification.belongsTo(User, {
    foreignKey: "user",
    targetKey: "user_id",
    as: "notificationUser",
  });

  Notification.belongsTo(Blog, {
    foreignKey: "blog",
    targetKey: "blog_id",
    as: "notificationBlog",
  });

  Notification.belongsTo(Comment, {
    foreignKey: "comment_id",
    as: "notificationComment",
  });

  Notification.belongsTo(Comment, {
    foreignKey: "reply",
    as: "replyComment",
  });

  Notification.belongsTo(Comment, {
    foreignKey: "replied_on_comment",
    as: "repliedOnComment",
  });

  // ================= READ =================
  Read.belongsTo(Blog, {
    targetKey: "blog_id",
    foreignKey: "blog_id",
    as: "blog",
  });

  Read.belongsTo(User, {
    targetKey: "user_id",
    foreignKey: "user_id",
    as: "user",
  });

  // ================= Blog Taxonomy/Categories =================

  Blog.belongsTo(BlogTaxonomy, {
    foreignKey: "taxonomy_id",
    targetKey: "id",
    as: "taxonomy",
  });

  BlogTaxonomy.hasMany(Blog, {
    foreignKey: "taxonomy_id",
    sourceKey: "id",
    as: "blogs",
  });
};
export default setupBlogAssociations;
