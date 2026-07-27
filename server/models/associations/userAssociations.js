import User from "../../models/user/User.js";
import Blog from "../blog/Blog.js";
import Comment from "../blog/Comment.js";
import Like from "../blog/Like.js";
import Notification from "../blog/Notification.js";
import Profession from "../Profession.js";
import UserIPHistory from "../user/UserIPHistory.js";
import Donation from "../Donation.js";
import UserDetails from "../user/UserDetails.js";
import Interest from "../user/Interest.js";
import UserInterest from "../user/UserInterest.js";
import Enrollment from "../user/Enrollment.js";

const setupUserAssociations = () => {
  // ================= USER Details =================

  User.hasOne(UserDetails, {
    foreignKey: "user_id",
    as: "details",
  });

  UserDetails.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
  });

  // ================= USER =================
  User.hasMany(Blog, {
    foreignKey: "author",
    sourceKey: "user_id",
    as: "userBlogs",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  User.hasMany(Comment, {
    foreignKey: "commented_by",
    sourceKey: "user_id",
    as: "comments",
    onDelete: "CASCADE",
  });
  User.hasMany(Donation, {
    foreignKey: "user_id",
    sourceKey: "user_id",
    as: "userDonations",
    onDelete: "SET NULL",
  });
  User.hasMany(Like, {
    foreignKey: "user_id",
    sourceKey: "user_id",
    as: "userLikes",
    onDelete: "CASCADE",
  });

  User.hasMany(Notification, {
    foreignKey: "notification_for",
    sourceKey: "user_id",
    as: "notifications",
  });

  User.hasMany(Notification, {
    foreignKey: "user",
    sourceKey: "user_id",
    as: "sentNotifications",
  });

  User.belongsTo(Profession, {
    foreignKey: "profession_id",
    targetKey: "profession_id",
    as: "profession",
  });

  //  USER ↔ INTEREST (M:N) |  INTEREST TREE (SELF)

  User.belongsToMany(Interest, {
    through: UserInterest,
    foreignKey: "user_id",
    otherKey: "interest_id",
    as: "Interests", //  IMPORTANT (used in include)
    onDelete: "CASCADE",
  });

  Interest.belongsToMany(User, {
    through: UserInterest,
    foreignKey: "interest_id",
    otherKey: "user_id",
    as: "Users", // REQUIRED for COUNT query
    onDelete: "CASCADE",
  });

  Interest.hasMany(Interest, {
    as: "children",
    foreignKey: "parent_id",
    onDelete: "CASCADE",
  });

  Interest.belongsTo(Interest, {
    as: "parent",
    foreignKey: "parent_id",
  });

  // ================= USER IP =================
  UserIPHistory.belongsTo(User, {
    foreignKey: "user_id",
    targetKey: "user_id",
    as: "user",
  });
  User.hasMany(UserIPHistory, {
    foreignKey: "user_id",
    sourceKey: "user_id",
    as: "ipHistory",
    onDelete: "CASCADE",
  });
  // ================ User- Enrollment=======
  User.hasOne(Enrollment, {
    foreignKey: "user_id",
    as: "enrollment",
    onDelete: "CASCADE",
  });
  Enrollment.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
  });
};
export default setupUserAssociations;
