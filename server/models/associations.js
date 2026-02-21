import User from "./User.js";
import Blog from "./Blog.js";
import Comment from "./Comment.js";
import Like from "./Like.js";
import Read from "./Read.js";
import Notification from "./Notification.js";
import Profession from "./Profession.js";
import UserIPHistory from "./UserIPHistory.js"; // <-- Add this import
import Donor from "./Donor.js";
import Donation from "./Donation.js";
import Expenditure from "./Expenditure.js";
import BalanceSnapshot from "./BalanceSnapshot.js";
// Function to set up all associations
const setupAssociations = () => {
  // Create models object
  const models = {
    User,
    Blog,
    Comment,
    Like,
    Read,
    Notification,
    Profession,
    UserIPHistory,
    Donor,
    Donation,
    Expenditure,
    BalanceSnapshot,
  };

  // Define associations for User
  User.hasMany(Blog, { foreignKey: "author", as: "userBlogs" });
  User.hasMany(Comment, { foreignKey: "commented_by", as: "comments" });
  User.hasMany(Like, { foreignKey: "user_id", as: "userLikes" }); // Added this missing association
  User.hasMany(Notification, {
    foreignKey: "notification_for",
    as: "notifications",
  });
  User.hasMany(Notification, { foreignKey: "user", as: "sentNotifications" });
  User.belongsTo(Profession, { foreignKey: "profession_id", as: "profession" });
  User.hasMany(UserIPHistory, { foreignKey: "user_id", as: "ipHistory" });

  // Define associations for Blog
  Blog.belongsTo(User, { foreignKey: "author", as: "blogAuthor" });
  Blog.hasMany(Comment, {
    sourceKey: "blog_id",
    foreignKey: "blog_id",
    as: "comments",
  });
  Blog.hasMany(Notification, {
    sourceKey: "blog_id", // Use blog_id from Blog table
    foreignKey: "blog",
    as: "notifications",
  });
  Blog.hasMany(Like, {
    sourceKey: "blog_id", // Use blog_id from Blog table
    foreignKey: "blog_id", // References blog_id in Like table
    as: "likes",
  });
  Blog.hasMany(Read, {
    sourceKey: "blog_id",
    foreignKey: "blog_id",
    as: "reads",
  });

  // Define associations for Like
  Like.belongsTo(Blog, {
    targetKey: "blog_id", // Use blog_id in Blog table
    foreignKey: "blog_id", // References blog_id in Like table
    as: "blog",
  });
  Like.belongsTo(User, {
    targetKey: "user_id", // Use user_id in User table
    foreignKey: "user_id", // References user_id in Like table
    as: "user",
  });

  // Define associations for Comment
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
  Comment.hasMany(Comment, { foreignKey: "parent_comment_id", as: "replies" });
  Comment.hasMany(Notification, {
    foreignKey: "comment_id",
    as: "commentNotifications",
  });

  // Define associations for Notification
  Notification.belongsTo(User, {
    foreignKey: "notification_for",
    as: "notificationFor",
  });
  Notification.belongsTo(User, { foreignKey: "user", as: "notificationUser" });
  Notification.belongsTo(Blog, {
    foreignKey: "blog",
    targetKey: "blog_id", // This tells Sequelize to match with blog_id field in Blog table
    as: "notificationBlog",
  });
  Notification.belongsTo(Comment, {
    foreignKey: "comment_id",
    as: "notificationComment",
  });
  Notification.belongsTo(Comment, { foreignKey: "reply", as: "replyComment" });
  Notification.belongsTo(Comment, {
    foreignKey: "replied_on_comment",
    as: "repliedOnComment",
  });

  // Define associations for Read
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

  // Define associations for Profession
  Profession.hasMany(User, { foreignKey: "profession_id", as: "users" });
  Profession.belongsTo(Profession, {
    foreignKey: "parent_id",
    as: "parentProfession",
  });
  Profession.hasMany(Profession, {
    foreignKey: "parent_id",
    as: "childProfessions",
  });

  UserIPHistory.belongsTo(User, { foreignKey: "user_id", as: "user" });

  // Donations domain associations
  User.hasOne(Donor, { foreignKey: "user_id", as: "donorProfile" });
  Donor.belongsTo(User, { foreignKey: "user_id", as: "user" });
  Donor.hasMany(Donation, { foreignKey: "donor_id", as: "donations" });
  Donation.belongsTo(Donor, { foreignKey: "donor_id", as: "donor" });
  Donation.belongsTo(User, {
    foreignKey: "user_id",
    targetKey: "user_id",
    as: "user",
  });

  // Expenditure is global (not per user) for initiatives
  // BalanceSnapshot is global periodic snapshot
  console.log("✅ All associations set up successfully!");

  return models;
};

export {
  User,
  Blog,
  Like,
  Comment,
  Read,
  Notification,
  Profession,
  UserIPHistory,
  Donor,
  Donation,
  Expenditure,
  BalanceSnapshot,
  setupAssociations,
};
