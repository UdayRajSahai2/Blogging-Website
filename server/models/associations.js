import User from "../models/user/User.js";
import Blog from "./blog/Blog.js";
import Comment from "./blog/Comment.js";
import Like from "./blog/Like.js";
import Notification from "./blog/Notification.js";
import Profession from "./Profession.js";
import UserIPHistory from "./user/UserIPHistory.js";
import Donor from "./Donor.js";
import Donation from "./Donation.js";
import Expenditure from "./Expenditure.js";
import BalanceSnapshot from "./BalanceSnapshot.js";

import Country from "./locations/Country.js";
import State from "./locations/State.js";
import District from "./locations/District.js";
import Block from "./locations/Block.js";
import Village from "./locations/Village.js";

import UserDetails from "./user/UserDetails.js";

// Association Modules
import setupBlogAssociations from "./associations/blogAssociations.js";
import setupUserAssociations from "./associations/userAssociations.js";
import setupDonationAssociations from "./associations/donationAssociations.js";
import setupProfessionalAssociations from "./associations/professionalAssociations.js";
import setupAcademicAssociations from "./associations/academicAssociations.js";
import setupPageAssociations from "./associations/pageAssociations.js";
import setupLocationAssociations from "./associations/locationAssociations.js";
import setupUserRoleAssociations from "./associations/userRoleAssociations.js";

const setupAssociations = () => {
  setupBlogAssociations();
  setupUserAssociations();
  setupDonationAssociations();
  setupProfessionalAssociations();
  setupAcademicAssociations();
  setupPageAssociations();
  setupLocationAssociations();
  setupUserRoleAssociations();

  console.log("[ASSOCIATIONS] All modules initialized successfully");
};

export {
  User,
  Blog,
  Comment,
  Like,
  Notification,
  Profession,
  UserDetails,
  UserIPHistory,
  Donor,
  Donation,
  Expenditure,
  BalanceSnapshot,
  Country,
  State,
  District,
  Block,
  Village,

  // Setup
  setupAssociations,
};
