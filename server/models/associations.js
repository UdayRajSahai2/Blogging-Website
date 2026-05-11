import User from "../models/user/User.js";
import Blog from "./blog/Blog.js";
import Comment from "./blog/Comment.js";
import Like from "./blog/Like.js";
import Read from "./blog/Read.js";
import Notification from "./blog/Notification.js";
import Profession from "./Profession.js";
import UserIPHistory from "./user/UserIPHistory.js";
import Donor from "./Donor.js";
import Donation from "./Donation.js";
import Expenditure from "./Expenditure.js";
import BalanceSnapshot from "./BalanceSnapshot.js";
import UserAcademic from "./user/UserAcademic.js";
import Country from "./locations/Country.js";
import State from "./locations/State.js";
import District from "./locations/District.js";
import Block from "./locations/Block.js";
import Village from "./locations/Village.js";
import UserDetails from "./user/UserDetails.js";
import UserAddress from "./user/UserAddress.js";
import setupProfessionalAssociations from "./associations/professionalProfileAssociations.js";
import setupChatAssociations from "./associations/chatAssociations.js";
import setupUserAddressAssociations from "./associations/userAddressAssociations.js";
import setupRoleAssociations from "./roles/roleAssociations.js";
import setupUserInterestsAssociations from "./associations/userInterestsAssociations.js";
import setupUserConnectionAssociations from "./associations/userConnectionAssociations.js";
import setupPageAssociations from "./associations/pageAssocations.js";
// Function to set up all associations

const setupAssociations = () => {
  setupUserAddressAssociations();
  setupProfessionalAssociations();
  setupChatAssociations();
  setupUserInterestsAssociations();
  setupUserConnectionAssociations();
  //  NEW ( modular system)
  setupRoleAssociations();
  setupPageAssociations();

  console.log(" All associations initialized");
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
    UserAcademic,
    UserDetails,
    UserAddress,
  };

  // ================= USER Details =================

  User.hasOne(UserDetails, {
    foreignKey: "user_id",
    as: "details",
  });

  UserDetails.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
  });

  // Country → State
  Country.hasMany(State, {
    foreignKey: "country_code",
    sourceKey: "country_code",
  });
  State.belongsTo(Country, {
    foreignKey: "country_code",
    targetKey: "country_code",
  });

  // State → District
  State.hasMany(District, {
    foreignKey: "state_code",
    sourceKey: "state_code",
  });
  District.belongsTo(State, {
    foreignKey: "state_code",
    targetKey: "state_code",
  });

  // District → Block
  District.hasMany(Block, {
    foreignKey: "district_code",
    sourceKey: "district_code",
  });
  Block.belongsTo(District, {
    foreignKey: "district_code",
    targetKey: "district_code",
  });

  // Block → Village
  Block.hasMany(Village, { foreignKey: "block_code", sourceKey: "block_code" });
  Village.belongsTo(Block, {
    foreignKey: "block_code",
    targetKey: "block_code",
  });
  /* ======================================================
   USER ↔ ACADEMICS
====================================================== */

  // One user → many academic records
  User.hasMany(UserAcademic, {
    foreignKey: {
      name: "user_id",
      allowNull: false,
    },
    as: "academics",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    constraints: true,
  });

  // Each academic record belongs to one user
  UserAcademic.belongsTo(User, {
    foreignKey: {
      name: "user_id",
      allowNull: false,
    },
    as: "user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    constraints: true,
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

  User.hasMany(UserIPHistory, {
    foreignKey: "user_id",
    sourceKey: "user_id",
    as: "ipHistory",
    onDelete: "CASCADE",
  });

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

  // ================= PROFESSION =================
  Profession.hasMany(User, {
    foreignKey: "profession_id",
    as: "users",
  });

  Profession.belongsTo(Profession, {
    foreignKey: "parent_id",
    as: "parentProfession",
  });

  Profession.hasMany(Profession, {
    foreignKey: "parent_id",
    as: "childProfessions",
  });

  // ================= USER IP =================
  UserIPHistory.belongsTo(User, {
    foreignKey: "user_id",
    targetKey: "user_id",
    as: "user",
  });

  // ================= DONATIONS =================
  User.hasOne(Donor, {
    foreignKey: "user_id",
    sourceKey: "user_id",
    as: "donorProfile",
    onDelete: "CASCADE", // ensures donor removed if user deleted
    onUpdate: "CASCADE",
  });

  Donor.belongsTo(User, {
    foreignKey: "user_id",
    targetKey: "user_id",
    as: "user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  Donor.hasMany(Donation, {
    foreignKey: "donor_id",
    as: "donations",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  });

  Donation.belongsTo(Donor, {
    foreignKey: "donor_id",
    as: "donor",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  });

  Donation.belongsTo(User, {
    foreignKey: "user_id",
    targetKey: "user_id",
    as: "user",
    onDelete: "SET NULL", // financial history preserved
    onUpdate: "CASCADE",
  });

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
  UserAcademic,
  Country,
  State,
  District,
  Block,
  Village,
  UserDetails,
  UserAddress,
  setupAssociations,
};
