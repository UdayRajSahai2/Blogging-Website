import express from "express";
import dotenv from "dotenv";
import Sequelize from "sequelize";
import sequelize from "./config/db.js";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from "cors";
import admin from "firebase-admin";
import serviceAccountKey from "./data/reactjs-blogging-website-ac6e9-firebase-adminsdk-fbsvc-9c580bec3f.json" with { type: "json" };
import { getAuth } from "firebase-admin/auth";
import aws from "aws-sdk";
import { Op } from "sequelize";
// import multer from 'multer';
// import path from 'path';

import { generateOTP, sendEmailOTP, sendSMSOTP } from "./utils/otp.js";
import {
  User,
  Profession,
  Blog,
  Comment,
  Like,
  Read,
  Notification,
  UserIPHistory,
  Donor,
  Donation,
  Expenditure,
  BalanceSnapshot,
  setupAssociations,
} from "./Schema/associations.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { generateCustomerIdFromLocation } from "./utils/customerIdFromLocation.js";
import axios from "axios"; // Add at the top if not present
import Razorpay from "razorpay";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up associations
setupAssociations({
  User,
  Blog,
  Comment,
  Notification,
  Profession,
  UserIPHistory,
  Donor,
  Donation,
  Expenditure,
  BalanceSnapshot,
});

// Log associations to verify they are correctly imported
console.log("User associations in server.js:", User.associations);
console.log("Blog associations in server.js:", Blog.associations);

dotenv.config();

const server = express();

// Middleware
server.use(express.json());

server.use(cors());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

//setting up s3 bucket
const s3 = new aws.S3({
  region: "ap-south-1",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const generateUploadURL = async () => {
  const date = new Date();
  const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

  return await s3.getSignedUrlPromise("putObject", {
    Bucket: "blogging-website-co",
    Key: imageName,
    Expires: 1000,
    ContentType: "image/jpeg",
  });
};

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token === null) {
    return res.status(401).json({ error: "No access token" });
  }
  jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Access token is invalid" });
    }
    req.user = user.user_id;
    console.log("Decoded User Object: ", user);
    console.log("req.user: ", req.user);
    next();
  });
};

const formatDatatoSend = (user) => {
  const access_token = jwt.sign(
    { user_id: user.user_id },
    process.env.SECRET_ACCESS_KEY
  );
  // Verify consistency
  const decoded = jwt.decode(access_token);
  if (decoded.user_id !== user.user_id) {
    throw new Error("User ID mismatch in token generation");
  }
  return {
    access_token,
    profile_img: user.profile_img,
    username: user.username,
    fullname: user.fullname,
    user_id: user.user_id,
  };
};

const generateUsername = async (email) => {
  let username = email.split("@")[0];
  let usernameExists = await User.findOne({ where: { username } });

  if (usernameExists) {
    username += nanoid(3); // Append a 3-character random string
  }

  return username;
};

// Database Connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL Database Connected!");
    // Disable alter and force for all sync operations
    const syncOptions = {
      alter: false, // Disable automatic table changes
      force: false, // Make sure this is false (or you'll lose data)
    };
    await User.sync(syncOptions);
    await Profession.sync(syncOptions);
    await Comment.sync(syncOptions);
    await Notification.sync(syncOptions);
    await Blog.sync(syncOptions);
    await Like.sync(syncOptions);
    await Read.sync(syncOptions);
    await UserIPHistory.sync(syncOptions);
    // await Comment.sync({ alter: true });
    // await Notification.sync({ alter: true });
    console.log("✅ All tables are ready!");
  } catch (error) {
    console.error("❌ Database Connection Error:", error);
    process.exit(1);
  }
};

connectDB();

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex =
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{12,}$/;

let mobileRegex = /^[+]?[0-9]{10,15}$/;

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",").shift() ||
    req.socket?.remoteAddress ||
    null
  );
}

// In-memory store for pending signups (for demo; use Redis in production)
const pendingSignups = {};

server.post("/signup", async (req, res) => {
  let {
    first_name,
    last_name,
    email,
    password,
    mobile_number,
    latitude,
    longitude,
  } = req.body;

  if (!first_name || first_name.length < 1) {
    return res.status(403).json({ error: "❌ First name is required" });
  }
  if (!last_name || last_name.length < 1) {
    return res.status(403).json({ error: "❌ Last name is required" });
  }
  if (!email || !emailRegex.test(email)) {
    return res.status(403).json({ error: "❌ Email is invalid" });
  }
  if (!password || !passwordRegex.test(password)) {
    return res.status(403).json({
      error:
        "❌ Password must be at least 12 characters with uppercase, lowercase, number and special character",
    });
  }
  if (mobile_number && !mobileRegex.test(mobile_number)) {
    return res.status(403).json({ error: "❌ Mobile number is invalid" });
  }
  if (latitude == null || longitude == null) {
    return res.status(400).json({
      error: "❌ Location (latitude and longitude) is required for signup",
    });
  }

  try {
    // Use OpenStreetMap Nominatim for reverse geocoding
    let nominatimUrl = process.env.NOMINATIM_URL;
    if (nominatimUrl) {
      nominatimUrl = nominatimUrl
        .replace(/\{lat\}/g, latitude)
        .replace(/\{lon\}/g, longitude);
    }
    const geoRes = await axios.get(nominatimUrl, {
      headers: { "User-Agent": "mern-blog-app/1.0" },
    });
    console.log("geoRes: ", geoRes);
    const address = geoRes.data.address || {};
    console.log("address: ", address);
    const country = address.country || "India";
    const state = address.state || address.state_district || "";
    console.log("state: ", state);
    const district =
      address.county || address.city_district || address.state_district || "";
    const blockOrSub =
      address.city_district ||
      address.county ||
      address.residential ||
      address.city ||
      address.suburb ||
      "";
    const village =
      address.village ||
      address.city ||
      address.city_district ||
      address.county ||
      address.residential ||
      address.town ||
      address.suburb ||
      "";

    if (!country || !state || !district || !blockOrSub || !village) {
      return res.status(400).json({
        error:
          "❌ Could not determine full location from coordinates. Please try again from a more specific location.",
      });
    }

    // Generate customer_id and abbr using LGD data
    const { customer_id, abbr, codes } = generateCustomerIdFromLocation({
      country,
      state,
      district,
      blockOrSub,
      village,
    });
    const hashed_password = await bcrypt.hash(password, 10);
    let username = await generateUsername(email);

    // Check if email or mobile already exists in DB
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }, { mobile_number }] },
    });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ error: "❌ Email already exists" });
      }
      if (existingUser.mobile_number === mobile_number) {
        return res
          .status(400)
          .json({ error: "❌ Mobile number already exists" });
      }
    }

    // Generate OTP and store all signup data in memory
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    pendingSignups[email] = {
      first_name,
      last_name,
      email,
      password: hashed_password,
      username,
      mobile_number: mobile_number || null,
      google_auth: false,
      customer_id,
      country_code: codes.country,
      state_code: codes.state,
      district_code: codes.district,
      block_code: codes.block,
      village_code: codes.village,
      latitude,
      longitude,
      otp,
      otpExpires,
      abbr,
      otpVerified: false,
    };

    await sendEmailOTP(email, otp);
    await sendSMSOTP(mobile_number, otp);

    return res.status(200).json({ message: "OTP sent to your email/mobile" });
  } catch (error) {
    console.error("Signup error:", error);
    if (error.message && error.message.includes("No matching village")) {
      return res.status(400).json({
        error: "❌ Invalid location data: village not found in LGD data",
      });
    }
    return res.status(500).json({ error: "❌ Server error during signup" });
  }
});

server.post("/change-password", verifyJWT, async (req, res) => {
  let { currentPassword, newPassword } = req.body;

  // Input validation
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      error: "❌ Both current password and new password are required",
    });
  }

  if (!passwordRegex.test(newPassword)) {
    return res.status(403).json({
      error:
        "❌ New password must be at least 12 characters long and include at least one numeric digit, one lowercase letter, one uppercase letter, and one special character.",
    });
  }

  // Check if new password is different from current password
  if (currentPassword === newPassword) {
    return res.status(400).json({
      error: "❌ New password must be different from current password",
    });
  }

  try {
    // Find the user by ID (from JWT token)
    const user = await User.findOne({
      where: { user_id: req.user },
    });

    if (!user) {
      return res.status(404).json({ error: "❌ User not found" });
    }

    // Check if user signed up with Google
    if (user.google_auth) {
      return res.status(403).json({
        error:
          "❌ Cannot change password for Google authenticated account. Use Google to manage your password.",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res
        .status(403)
        .json({ error: "❌ Current password is incorrect" });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password in database
    await User.update(
      { password: hashedNewPassword },
      { where: { user_id: req.user } }
    );

    return res.status(200).json({
      message: "✅ Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      error: "❌ Server error occurred while changing password",
    });
  }
});

server.post("/signin", async (req, res) => {
  let { email, password, latitude, longitude } = req.body;

  // Input validation
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "❌ Email and password are required" });
  }

  try {
    let user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(403).json({ error: "❌ Email not found" });
    }

    if (!user.google_auth) {
      // Compare the entered password with the hashed password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(403).json({ error: "❌ Incorrect password" });
      }

      // --- Generate customer_id if missing (like signup) ---
      if (!user.customer_id) {
        if (latitude == null || longitude == null) {
          // Return clear error so frontend can prompt for location
          return res.status(400).json({
            error: "Location required to generate customer_id for this user",
          });
        }
        try {
          // Use OpenStreetMap Nominatim for reverse geocoding (like signup)
          let nominatimUrl = process.env.NOMINATIM_URL;
          if (nominatimUrl) {
            nominatimUrl = nominatimUrl
              .replace(/\{lat\}/g, latitude)
              .replace(/\{lon\}/g, longitude);
          }
          const geoRes = await axios.get(nominatimUrl, {
            headers: { "User-Agent": "mern-blog-app/1.0" },
          });
          const address = geoRes.data.address || {};
          const country = address.country || "India";
          const state = address.state || address.state_district || "";
          const district =
            address.county ||
            address.city_district ||
            address.state_district ||
            "";
          const blockOrSub =
            address.city_district ||
            address.county ||
            address.residential ||
            address.city ||
            address.suburb ||
            "";
          const village =
            address.village ||
            address.city ||
            address.city_district ||
            address.county ||
            address.residential ||
            address.town ||
            address.suburb ||
            "";

          if (country && state && district && blockOrSub && village) {
            // Generate customer_id and abbr using LGD data (like signup)
            const { customer_id, abbr, codes } = generateCustomerIdFromLocation(
              { country, state, district, blockOrSub, village }
            );
            if (customer_id) {
              await user.update({
                customer_id,
                abbr,
                country_code: codes.country,
                state_code: codes.state,
                district_code: codes.district,
                block_code: codes.block,
                village_code: codes.village,
                current_latitude: latitude, 
                current_longitude: longitude,
                location_updated_at: new Date(), // Add this to track when location was updated
              });
              
              // Reload user data after update
              user = await User.findOne({ where: { email } });
              
              console.log("User updated with location:", {
                user_id: user.user_id,
                customer_id: user.customer_id,
                abbr: user.abbr,
                country_code: user.country_code,
                state_code: user.state_code,
                district_code: user.district_code,
                block_code: user.block_code,
                village_code: user.village_code,
                current_latitude: user.current_latitude,
                current_longitude: user.current_longitude,
              });
            }
          }
        } catch (err) {
          console.error("Error generating customer_id on signin:", err);
          // Do not block signin if customer_id generation fails
        }
      } else {
        // customer_id exists, so only update lat/lon if user has moved
        if (
          latitude != null &&
          longitude != null &&
          (user.current_latitude !== latitude ||
            user.current_longitude !== longitude)
        ) {
          await user.update({
            current_latitude: latitude,
            current_longitude: longitude,
            location_updated_at: new Date(), // Add this to track when location was updated
          });
          
          // Reload user data after update
          user = await User.findOne({ where: { email } });
          
          console.log("User location updated (lat/lon only):", {
            user_id: user.user_id,
            current_latitude: user.current_latitude,
            current_longitude: user.current_longitude,
          });
        }
      }
      // --- End customer_id logic ---
      const ip_address = getClientIp(req);
      if (user && ip_address) {
        await UserIPHistory.create({
          user_id: user.user_id,
          ip_address,
          created_at: new Date(),
        });
      }
      return res.json(formatDatatoSend(user));
    } else {
      return res.status(403).json({
        error:
          "❌ Account was created using Google. Try logging in with Google",
      });
    }
  } catch (err) {
    console.error("Signin error:", err);
    return res.status(500).json({ error: "❌ Server error during signin" });
  }
});

// IMPROVED GOOGLE AUTH ENDPOINT
server.post("/google-auth", async (req, res) => {
  let { access_token } = req.body;

  console.log("=== Google Auth Request ===");
  console.log("Received request body:", req.body);

  if (!access_token) {
    console.log("❌ No access token provided");
    return res.status(400).json({ error: "❌ Access token is missing" });
  }

  try {
    console.log("🔍 Verifying Firebase ID token...");
    console.log(
      "Token (first 50 chars):",
      access_token.substring(0, 50) + "..."
    );

    // Verify the Firebase ID token
    const decodedUser = await getAuth().verifyIdToken(access_token);

    if (!decodedUser) {
      console.log("❌ Token verification failed - no decoded user");
      throw new Error("Failed to verify token");
    }

    console.log("✅ Token verified successfully");
    console.log("Decoded user info:", {
      email: decodedUser.email,
      name: decodedUser.name,
      uid: decodedUser.uid,
      picture: decodedUser.picture ? "present" : "not present",
    });

    let { email, name, picture, uid } = decodedUser;

    // Validate required fields
    if (!email || !name) {
      console.log("❌ Missing required fields from Google");
      throw new Error("Missing required user information from Google");
    }

    // Improve picture quality if available
    if (picture) {
      picture = picture.replace("s96-c", "s384-c");
    }

    console.log("🔍 Checking if user exists in database...");
    // Check if user already exists
    let user = await User.findOne({ where: { email } });

    if (user) {
      console.log("👤 User found in database:", user.user_id);

      // If user exists but not with Google auth, prevent login
      if (!user.google_auth) {
        console.log("❌ User exists but not with Google auth");
        return res.status(403).json({
          error:
            "❌ This email was signed up without Google. Please log in with a password.",
        });
      }

      // User exists and has Google auth, update profile image if it has changed
      if (picture && user.profile_img !== picture) {
        console.log("📸 Updating profile image...");
        await User.update(
          { profile_img: picture },
          { where: { user_id: user.user_id } }
        );
        // Refresh user data
        user = await User.findOne({ where: { email } });
      }

      console.log("✅ Existing Google user logged in successfully");
    } else {
      console.log("🆕 Creating new user...");

      // If user doesn't exist, create new user
      let username = await generateUsername(email);

      user = await User.create({
        fullname: name,
        email,
        profile_img: picture || "", // Provide default empty string if no picture
        username,
        google_auth: true,
        password: null, // No password for Google auth users
      });

      console.log("✅ New Google user created successfully:", user.user_id);
    }

    const responseData = formatDatatoSend(user);
    console.log("📤 Sending response for user:", user.user_id);

    return res.status(200).json(responseData);
  } catch (err) {
    console.error("❌ Google Auth Error Details:", err);

    // Handle specific Firebase auth errors
    if (err.code === "auth/id-token-expired") {
      console.log("🕐 Token expired");
      return res.status(401).json({
        error: "❌ Token has expired. Please sign in again.",
      });
    } else if (err.code === "auth/invalid-id-token") {
      console.log("🔒 Invalid token");
      return res.status(401).json({
        error: "❌ Invalid token. Please sign in again.",
      });
    } else if (err.code === "auth/project-not-found") {
      console.log("🚫 Firebase project not found");
      return res.status(500).json({
        error: "❌ Firebase project configuration error.",
      });
    } else if (err.code === "auth/argument-error") {
      console.log("📝 Token format error");
      return res.status(400).json({
        error: "❌ Invalid token format.",
      });
    }

    // Database errors
    if (err.name && err.name.includes("Sequelize")) {
      console.log("🗄️ Database error");
      return res.status(500).json({
        error: "❌ Database error during Google authentication.",
      });
    }

    return res.status(500).json({
      error: "❌ Failed to authenticate with Google. Please try again.",
    });
  }
});

//upload image URL
server.get("/get-upload-url", (req, res) => {
  generateUploadURL()
    .then((url) => res.status(200).json({ uploadURL: url }))
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

server.post("/latest-blogs", async (req, res) => {
  let maxLimit = 5;
  let { page } = req.body;

  try {
    // Calculate offset for pagination
    let offset = (page - 1) * maxLimit;
    if (req.body.fetchAll) {
      maxLimit = null;
      offset = null;
    }

    // Fetch all published blogs with author information
    const blogs = await Blog.findAll({
      where: { draft: false },
      include: [
        {
          model: User,
          as: "blogAuthor",
          attributes: ["profile_img", "username", "fullname"],
        },
      ],
      order: [["publishedAt", "DESC"]],
      attributes: [
        "blog_id",
        "title",
        "des",
        "banner",
        "tags",
        "publishedAt",
        "createdAt",
        "updatedAt",
      ],
      offset: offset, // Use offset instead of skip
      limit: maxLimit,
    });

    if (!blogs.length) {
      return res.status(200).json({
        status: "success",
        results: 0,
        blogs: [],
      });
    }

    const blogIds = blogs.map((blog) => blog.blog_id);

    // Count likes, comments, reads, and parent comments
    const [likesCounts, commentsCounts, readsCounts, parentCommentsCounts] =
      await Promise.all([
        Like.findAll({
          attributes: [
            "blog_id",
            [sequelize.fn("COUNT", sequelize.col("blog_id")), "count"],
          ],
          where: { blog_id: blogIds },
          group: ["blog_id"],
          raw: true,
        }),

        Comment.findAll({
          attributes: [
            "blog_id",
            [sequelize.fn("COUNT", sequelize.col("blog_id")), "count"],
          ],
          where: { blog_id: blogIds },
          group: ["blog_id"],
          raw: true,
        }),

        Read.findAll({
          attributes: [
            "blog_id",
            [sequelize.fn("COUNT", sequelize.col("blog_id")), "count"],
          ],
          where: { blog_id: blogIds },
          group: ["blog_id"],
          raw: true,
        }),

        // Count only parent comments (where parent_comment_id is null)
        Comment.findAll({
          attributes: [
            "blog_id",
            [sequelize.fn("COUNT", sequelize.col("blog_id")), "count"],
          ],
          where: {
            blog_id: blogIds,
            parent_comment_id: null,
          },
          group: ["blog_id"],
          raw: true,
        }),
      ]);

    // Create lookup maps
    const createCountMap = (items) => {
      return items.reduce((acc, item) => {
        acc[item.blog_id] = item.count;
        return acc;
      }, {});
    };

    const likesMap = createCountMap(likesCounts);
    const commentsMap = createCountMap(commentsCounts);
    const readsMap = createCountMap(readsCounts);
    const parentCommentsMap = createCountMap(parentCommentsCounts);

    // Combine blog data with activity counts
    const blogsWithActivity = blogs.map((blog) => {
      return {
        ...blog.get({ plain: true }),
        total_likes: likesMap[blog.blog_id] || 0,
        total_comments: commentsMap[blog.blog_id] || 0,
        total_reads: readsMap[blog.blog_id] || 0,
        total_parent_comments: parentCommentsMap[blog.blog_id] || 0,
      };
    });

    return res.status(200).json({
      status: "success",
      results: blogsWithActivity.length,
      blogs: blogsWithActivity,
      pagination: {
        currentPage: parseInt(page),
        perPage: maxLimit,
        totalPages: Math.ceil(blogsWithActivity.length / maxLimit),
      },
    });
  } catch (err) {
    console.error("Error fetching latest blogs:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch latest blogs",
      error: process.env.NODE_ENV === "development" ? err.message : null,
    });
  }
});

server.post("/all-latest-blogs-count", async (req, res) => {
  try {
    const count = await Blog.count({
      where: { draft: false },
    });

    return res.status(200).json({ totalDocs: count });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: err.message });
  }
});

server.get("/trending-blogs", async (req, res) => {
  let maxLimit = 5;

  try {
    // Fetch all published blogs with author information
    const blogs = await Blog.findAll({
      where: { draft: false },
      include: [
        {
          model: User,
          as: "blogAuthor",
          attributes: ["profile_img", "username", "fullname", "user_id"],
        },
      ],
      attributes: ["blog_id", "title", "publishedAt", "author"],
      limit: maxLimit,
    });

    if (!blogs.length) {
      return res.status(200).json({
        status: "success",
        results: 0,
        blogs: [],
      });
    }

    const blogIds = blogs.map((blog) => blog.blog_id);

    // Count likes, comments, reads, and parent comments
    const [likesCounts, commentsCounts, readsCounts, parentCommentsCounts] =
      await Promise.all([
        Like.findAll({
          attributes: [
            "blog_id",
            [sequelize.fn("COUNT", sequelize.col("blog_id")), "count"],
          ],
          where: { blog_id: blogIds },
          group: ["blog_id"],
          raw: true,
        }),

        Comment.findAll({
          attributes: [
            "blog_id",
            [sequelize.fn("COUNT", sequelize.col("blog_id")), "count"],
          ],
          where: { blog_id: blogIds },
          group: ["blog_id"],
          raw: true,
        }),

        Read.findAll({
          attributes: [
            "blog_id",
            [sequelize.fn("COUNT", sequelize.col("blog_id")), "count"],
          ],
          where: { blog_id: blogIds },
          group: ["blog_id"],
          raw: true,
        }),

        // Count only parent comments (where parent_comment_id is null)
        Comment.findAll({
          attributes: [
            "blog_id",
            [sequelize.fn("COUNT", sequelize.col("blog_id")), "count"],
          ],
          where: {
            blog_id: blogIds,
            parent_comment_id: null,
          },
          group: ["blog_id"],
          raw: true,
        }),
      ]);

    // Create lookup maps
    const createCountMap = (items) => {
      return items.reduce((acc, item) => {
        acc[item.blog_id] = item.count;
        return acc;
      }, {});
    };

    const likesMap = createCountMap(likesCounts);
    const commentsMap = createCountMap(commentsCounts);
    const readsMap = createCountMap(readsCounts);
    const parentCommentsMap = createCountMap(parentCommentsCounts);

    // Combine blog data with activity counts
    const blogsWithActivity = blogs.map((blog) => {
      return {
        ...blog.get({ plain: true }),
        total_likes: likesMap[blog.blog_id] || 0,
        total_comments: commentsMap[blog.blog_id] || 0,
        total_reads: readsMap[blog.blog_id] || 0,
        total_parent_comments: parentCommentsMap[blog.blog_id] || 0,
      };
    });

    // Sort the blogs by trending criteria
    const trendingBlogs = blogsWithActivity.sort((a, b) => {
      // First sort by total reads (descending)
      if (b.total_reads !== a.total_reads) {
        return b.total_reads - a.total_reads;
      }
      // Then sort by total likes (descending)
      if (b.total_likes !== a.total_likes) {
        return b.total_likes - a.total_likes;
      }
      // Finally sort by published date (newest first)
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });

    return res.status(200).json({
      status: "success",
      results: trendingBlogs.length,
      blogs: trendingBlogs,
    });
  } catch (err) {
    console.error("Error fetching trending blogs:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch trending blogs",
      error: process.env.NODE_ENV === "development" ? err.message : null,
    });
  }
});
server.post("/search-blogs", async (req, res) => {
  let { tag, query, author, page = 1, limit, eliminate_blog } = req.body;
  let maxLimit = limit ? parseInt(limit) : 2; // Use provided limit or default to 2

  if (!tag && !query && !author) {
    return res.status(400).json({
      status: "error",
      message: "Either tag, query or author parameter is required",
    });
  }

  try {
    let offset = (page - 1) * maxLimit;
    let whereClause = { draft: false };

    // Add eliminate_blog condition if provided
    if (eliminate_blog) {
      whereClause.blog_id = { [Op.ne]: eliminate_blog };
    }

    if (tag) {
      // For tag search (clicking on tags)
      const normalizedTag = tag.toLowerCase().trim();
      whereClause[Op.and] = [
        ...(whereClause[Op.and] || []), // Preserve existing conditions
        {
          [Op.or]: [
            sequelize.where(
              sequelize.fn(
                "JSON_SEARCH",
                sequelize.col("tags"),
                "one",
                `%${normalizedTag}%`
              ),
              { [Op.ne]: null }
            ),
            { tags: { [Op.like]: `%${normalizedTag}%` } },
          ],
        },
      ];
    } else if (query) {
      // For query search (search box) - search in both title AND tags
      const normalizedQuery = query.toLowerCase().trim();
      whereClause[Op.and] = [
        ...(whereClause[Op.and] || []), // Preserve existing conditions
        {
          [Op.or]: [
            { title: { [Op.like]: `%${normalizedQuery}%` } },
            sequelize.where(
              sequelize.fn(
                "JSON_SEARCH",
                sequelize.col("tags"),
                "one",
                `%${normalizedQuery}%`
              ),
              { [Op.ne]: null }
            ),
            { tags: { [Op.like]: `%${normalizedQuery}%` } },
          ],
        },
      ];
    } else if (author) {
      // For author search
      whereClause[Op.and] = [
        ...(whereClause[Op.and] || []), // Preserve existing conditions
        { author: author },
      ];
    }
    if (req.body.fetchAll) {
      maxLimit = null;
      offset = null;
    }

    const { count: totalBlogs, rows: blogs } = await Blog.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "blogAuthor",
          attributes: ["profile_img", "username", "fullname"],
        },
      ],
      attributes: ["blog_id", "title", "des", "banner", "tags", "publishedAt"],
      order: [["publishedAt", "DESC"]],
      limit: maxLimit,
      offset: offset,
    });

    if (!blogs.length) {
      return res.status(200).json({
        status: "success",
        results: totalBlogs,
        blogs: [],
      });
    }

    const blogIds = blogs.map((blog) => blog.blog_id);

    const [likesCounts, commentsCounts, readsCounts] = await Promise.all([
      Like.findAll({
        attributes: [
          "blog_id",
          [sequelize.fn("COUNT", sequelize.col("blog_id")), "count"],
        ],
        where: { blog_id: blogIds },
        group: ["blog_id"],
        raw: true,
      }),

      Comment.findAll({
        attributes: [
          "blog_id",
          [sequelize.fn("COUNT", sequelize.col("blog_id")), "count"],
        ],
        where: { blog_id: blogIds },
        group: ["blog_id"],
        raw: true,
      }),

      Read.findAll({
        attributes: [
          "blog_id",
          [sequelize.fn("COUNT", sequelize.col("blog_id")), "count"],
        ],
        where: { blog_id: blogIds },
        group: ["blog_id"],
        raw: true,
      }),
    ]);

    const createCountMap = (items) => {
      return items.reduce((acc, item) => {
        acc[item.blog_id] = item.count;
        return acc;
      }, {});
    };

    const likesMap = createCountMap(likesCounts);
    const commentsMap = createCountMap(commentsCounts);
    const readsMap = createCountMap(readsCounts);

    const blogsWithActivity = blogs.map((blog) => {
      return {
        ...blog.get({ plain: true }),
        total_likes: likesMap[blog.blog_id] || 0,
        total_comments: commentsMap[blog.blog_id] || 0,
        total_reads: readsMap[blog.blog_id] || 0,
      };
    });

    return res.status(200).json({
      status: "success",
      results: totalBlogs,
      blogs: blogsWithActivity,
      pagination: {
        currentPage: parseInt(page),
        perPage: maxLimit,
        totalPages: Math.ceil(totalBlogs / maxLimit),
      },
    });
  } catch (err) {
    console.error("Error searching blogs:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to search blogs",
      error: process.env.NODE_ENV === "development" ? err.message : null,
    });
  }
});

server.post("/search-blogs-count", async (req, res) => {
  let { tag, author, query } = req.body;

  try {
    let whereClause = { draft: false };

    if (tag) {
      const normalizedTag = tag.toLowerCase().trim();
      whereClause[Op.or] = [
        sequelize.where(
          sequelize.fn(
            "JSON_SEARCH",
            sequelize.col("tags"),
            "one",
            `%${normalizedTag}%`
          ),
          { [Op.ne]: null }
        ),
        { tags: { [Op.like]: `%${normalizedTag}%` } },
      ];
    } else if (query) {
      const normalizedQuery = query.toLowerCase().trim();
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${normalizedQuery}%` } },
        sequelize.where(
          sequelize.fn(
            "JSON_SEARCH",
            sequelize.col("tags"),
            "one",
            `%${normalizedQuery}%`
          ),
          { [Op.ne]: null }
        ),
        { tags: { [Op.like]: `%${normalizedQuery}%` } },
      ];
    } else if (author) {
      // For author search
      whereClause.author = author;
    }
    const count = await Blog.count({
      where: whereClause,
    });

    return res.status(200).json({
      totalDocs: count,
    });
  } catch (err) {
    console.error("Error counting search blogs:", err);
    return res.status(500).json({
      error: "Failed to count search blogs",
      details: process.env.NODE_ENV === "development" ? err.message : null,
    });
  }
});

server.post("/search-users", async (req, res) => {
  let { query } = req.body;

  if (!query || !query.trim()) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const users = await User.findAll({
      where: sequelize.where(
        sequelize.fn("LOWER", sequelize.col("username")),
        "LIKE",
        `%${query.toLowerCase()}%`
      ),
      limit: 50,
      attributes: ["fullname", "username", "profile_img"],
      order: [["username", "ASC"]],
    });

    return res.status(200).json({ users });
  } catch (err) {
    console.error("Error searching users:", err);
    return res.status(500).json({ error: err.message });
  }
});

server.post("/get-profile", async (req, res) => {
  try {
    const { username } = req.body;

    // Find user and exclude sensitive fields
    const user = await User.findOne({
      where: { username },
      attributes: {
        exclude: ["password", "google_auth", "updateAt"],
      },
      include: [], // You can include associated models here if needed
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
});

server.post("/create-blog", verifyJWT, async (req, res) => {
  let authorId = req.user;
  let { title, des, banner, tags, content, draft, id } = req.body;

  if (!title.length) {
    return res.status(403).json({ error: "You must provide a title" });
  }

  // Validation (same as before)
  if (!draft) {
    if (typeof des !== "string" || !des.length || des.length > 200) {
      return res.status(403).json({
        error: "You must provide blog description under 200 characters",
      });
    }
    if (!banner.length) {
      return res.status(403).json({
        error: "You must provide blog banner to publish it",
      });
    }
    if (!content.blocks || !content.blocks.length) {
      return res.status(403).json({
        error: "There must be some blog content to publish it",
      });
    }
    if (!tags.length || tags.length > 10) {
      return res.status(403).json({
        error: "Provide tags in order to publish the blog, Maximum 10",
      });
    }
  }

  try {
    tags = tags.map((tag) => tag.toLowerCase());
    let blog_id =
      id ||
      title
        .replace(/[^a-zA-Z0-9]/g, " ")
        .replace(/\s+/g, "-")
        .trim() + nanoid();

    if (id) {
      // UPDATE EXISTING BLOG (Sequelize version)
      const [updatedCount] = await Blog.update(
        {
          title,
          des,
          banner,
          content: JSON.stringify(content),
          tags: JSON.stringify(tags),
          draft: draft ? draft : false,
          publishedAt: draft ? null : new Date(),
        },
        {
          where: { blog_id, author: authorId }, // Only allow author to update
        }
      );

      if (updatedCount === 0) {
        return res
          .status(404)
          .json({ error: "Blog not found or not authorized" });
      }

      return res.status(200).json({ id: blog_id });
    } else {
      // CREATE NEW BLOG
      const blog = await Blog.create({
        title,
        des,
        banner,
        content: JSON.stringify(content),
        tags: JSON.stringify(tags),
        author: authorId,
        blog_id,
        draft: Boolean(draft),
        publishedAt: draft ? null : new Date(),
      });

      // Update user's post count
      const incrementVal = draft ? 0 : 1;
      await User.update(
        {
          total_posts: Sequelize.literal(`total_posts + ${incrementVal}`),
          blogs: Sequelize.fn(
            "JSON_ARRAY_APPEND",
            Sequelize.col("blogs"),
            "$",
            blog_id
          ),
        },
        { where: { user_id: authorId } }
      );

      return res.status(200).json({ id: blog.blog_id });
    }
  } catch (err) {
    console.error("Error in create-blog:", err);
    return res.status(500).json({
      error: err.message || "Failed to create/update blog",
    });
  }
});

server.post("/get-blog", async (req, res) => {
  const { blog_id, draft, mode } = req.body;
  const incrementVal = mode !== "edit" ? 1 : 0; // Only increment reads if not in edit mode

  try {
    // 1. Find the blog with author info
    const blog = await Blog.findOne({
      where: { blog_id },
      include: [
        {
          model: User,
          as: "blogAuthor",
          attributes: ["fullname", "username", "profile_img"],
        },
      ],
      attributes: [
        "blog_id",
        "title",
        "des",
        "content",
        "banner",
        "tags",
        "publishedAt",
        "draft",
      ],
    });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // 2. Reject if trying to access a draft without permission
    if (blog.draft && !draft) {
      return res.status(403).json({ error: "You cannot access draft blogs" });
    }

    // 3. Track a read (if not in edit mode)
    if (mode !== "edit") {
      await Read.create({ blog_id, user_id: req.user || 0 }); // Simple insert (no duplicates check)
    }

    // 4. Get activity counts (likes, comments, reads)
    const [total_likes, total_comments, total_reads] = await Promise.all([
      Like.count({ where: { blog_id } }),
      Comment.count({ where: { blog_id } }),
      Read.count({ where: { blog_id } }),
    ]);

    // 5. Increment author's read count (if not edit mode)
    if (incrementVal && blog.author) {
      await User.increment("total_reads", { where: { user_id: blog.author } });
    }

    // 6. Return the raw data (let frontend parse JSON strings if needed)
    return res.status(200).json({
      blog: {
        ...blog.get({ plain: true }),
        total_likes,
        total_comments,
        total_reads,
      },
    });
  } catch (err) {
    console.error("Error in /get-blog:", err);
    return res.status(500).json({ error: "Failed to fetch blog" });
  }
});

server.post("/handle-like", verifyJWT, async (req, res) => {
  // Validate request body structure first
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({
      success: false,
      message: "Invalid request format",
      error: "Expected JSON object",
    });
  }

  const { blog_id, isLiked } = req.body;
  const user_id = req.user;

  // Validate input types
  if (typeof isLiked !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "Invalid isLiked value",
      error: "isLiked must be true or false",
    });
  }

  if (!blog_id || typeof blog_id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid blog ID",
      error: "blog_id must be a non-empty string",
    });
  }

  const transaction = await sequelize.transaction();

  try {
    const trimmedBlogId = blog_id.trim();

    // Debug logging
    console.log("Processing like action:", {
      blog_id: trimmedBlogId,
      user_id,
      action: isLiked ? "like" : "unlike",
    });

    // FIRST: Get the blog with author info
    const blog = await Blog.findOne({
      where: { blog_id: trimmedBlogId },
      include: [
        {
          model: User,
          as: "blogAuthor",
          attributes: ["user_id", "fullname", "username", "profile_img"],
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE, // Lock the row for update
    });

    console.log("Blog Author : ", blog.author);
    if (!blog) {
      await transaction.rollback();
      return res.status(404).json({ error: "Blog not found" });
    }

    // Get the user who is liking/unliking
    const user = await User.findOne({
      where: { user_id },
      attributes: ["user_id", "fullname", "username", "profile_img"],
      transaction,
    });

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let result;
    let total_likes;

    if (isLiked) {
      // LIKE ACTION: Try to create like
      try {
        await Like.create(
          {
            blog_id: trimmedBlogId,
            user_id,
          },
          { transaction }
        );

        result = { status: "created" };

        // Create notification ONLY if:
        // 1. Like was created successfully
        // 2. User is not liking their own blog
        const blogAuthorId = blog.author || blog?.blogAuthor?.user_id;
        console.log("Creating notification for:", {
          blogAuthorId: blogAuthorId,
          currentUser: user_id,
          condition: blogAuthorId !== user_id,
        });

        if (blogAuthorId && blogAuthorId !== user_id) {
          await Notification.create(
            {
              type: "like",
              blog: trimmedBlogId,
              notification_for: blogAuthorId,
              user: user_id,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            { transaction }
          );
        }
      } catch (createErr) {
        if (createErr.name === "SequelizeUniqueConstraintError") {
          result = { status: "already_exists" };
        } else {
          throw createErr;
        }
      }
    } else {
      // UNLIKE ACTION: Delete from both likes and notifications
      const deletedLikeCount = await Like.destroy({
        where: { blog_id: trimmedBlogId, user_id },
        transaction,
      });

      // Also delete the corresponding notification
      const deletedNotificationCount = await Notification.destroy({
        where: {
          blog: trimmedBlogId,
          user: user_id,
          type: "like",
        },
        transaction,
      });

      console.log(
        `Deleted ${deletedLikeCount} likes and ${deletedNotificationCount} notifications`
      );

      result = {
        status: deletedLikeCount > 0 ? "deleted" : "not_found",
        deletedLikes: deletedLikeCount,
        deletedNotifications: deletedNotificationCount,
      };
    }

    // Get updated count
    total_likes = await Like.count({
      where: { blog_id: trimmedBlogId },
      transaction,
    });

    await transaction.commit();

    // Determine final like status
    const finalLikeStatus = isLiked
      ? result.status === "created"
        ? true
        : false
      : result.status === "deleted"
      ? false
      : true;

    console.log("Operation completed:", {
      result,
      total_likes,
      finalLikeStatus,
    });

    return res.json({
      success: true,
      total_likes,
      isLiked: finalLikeStatus,
      user: {
        user_id: user.user_id,
        fullname: user.fullname,
        username: user.username,
        profile_img: user.profile_img,
      },
    });
  } catch (err) {
    await transaction.rollback();

    console.error("Like operation failed:", {
      errorName: err.name,
      errorMessage: err.message,
      validationErrors: err.errors?.map((e) => e.message),
      stack: err.stack,
    });

    const errorResponse = {
      success: false,
      message: "Error processing like action",
    };

    if (err.name === "SequelizeValidationError") {
      errorResponse.error = "Data validation failed";
      errorResponse.details = err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      }));
    } else if (err.name === "SequelizeForeignKeyConstraintError") {
      errorResponse.error = "Invalid reference (blog or user doesn't exist)";
    } else {
      errorResponse.error = "Database operation failed";
    }

    if (process.env.NODE_ENV === "development") {
      errorResponse.debug = {
        error: err.name,
        message: err.message,
      };
    }

    return res.status(500).json(errorResponse);
  }
});

server.post("/check-like", verifyJWT, async (req, res) => {
  try {
    const { blog_id } = req.body;
    const user_id = req.user;

    const like = await Like.findOne({
      where: { blog_id, user_id },
    });

    //  // 2. Optional: Check notification if needed
    const notificationExists = await Notification.findOne({
      where: {
        user: user_id,
        type: "like",
        blog: blog_id,
      },
    });

    res.json({
      isLiked: !!like,
      hasNotification: !!notificationExists, // Include if needed
    });
  } catch (err) {
    console.error("Check like error:", err);
    res.status(500).json({ error: "Error checking like status" });
  }
});

server.post("/add-comment", verifyJWT, async (req, res) => {
  // Validate request body structure first
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({
      success: false,
      message: "Invalid request format",
      error: "Expected JSON object",
    });
  }

  const { blog_id, comment, replying_to } = req.body;
  const user_id = req.user;

  // Validate input
  if (!blog_id || typeof blog_id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid blog ID",
      error: "blog_id must be a non-empty string",
    });
  }

  if (!comment || typeof comment !== "string" || comment.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid comment",
      error: "comment must be a non-empty string",
    });
  }

  if (comment.trim().length > 1000) {
    return res.status(400).json({
      success: false,
      message: "Comment too long",
      error: "Comment must be under 1000 characters",
    });
  }

  const transaction = await sequelize.transaction();

  try {
    const trimmedBlogId = blog_id.trim();
    const trimmedComment = comment.trim();

    // Debug logging
    console.log("Processing comment action:", {
      blog_id: trimmedBlogId,
      user_id,
      isReply: !!replying_to,
      replying_to,
    });

    // 1. Get the blog with author info
    const blog = await Blog.findOne({
      where: { blog_id: trimmedBlogId },
      include: [
        {
          model: User,
          as: "blogAuthor",
          attributes: ["user_id", "fullname", "username", "profile_img"],
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!blog) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: "Blog not found",
      });
    }

    // 2. Get the user who is commenting
    const user = await User.findOne({
      where: { user_id },
      attributes: ["user_id", "fullname", "username", "profile_img"],
      transaction,
    });

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3. If this is a reply, validate parent comment exists
    let parentComment = null;
    if (replying_to) {
      // ✅ FIXED: Simplified query without problematic includes
      parentComment = await Comment.findOne({
        where: { comment_id: replying_to },
        attributes: ["comment_id", "commented_by", "children"], // Only get what we need
        transaction,
      });

      if (!parentComment) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: "Parent comment not found",
        });
      }
    }

    // 4. Generate unique comment ID
    const comment_id = `comment_${nanoid()}`;

    // 5. Create the comment
    const newComment = await Comment.create(
      {
        comment_id,
        blog_id: trimmedBlogId,
        blog_author: blog.author || blog?.blogAuthor?.user_id,
        comment: trimmedComment,
        commented_by: user_id,
        isReply: !!replying_to,
        parent_comment_id: replying_to || null,
        children: [], // Initialize as empty array
      },
      { transaction }
    );

    // 6. If this is a reply, update parent comment's children array
    if (replying_to && parentComment) {
      const currentChildren = parentComment.children || [];
      const updatedChildren = [...currentChildren, comment_id];

      await Comment.update(
        { children: updatedChildren },
        {
          where: { comment_id: replying_to },
          transaction,
        }
      );
    }

    // 7. Create notification for blog author (if commenter is not the blog author)
    const blogAuthorId = blog.author || blog?.blogAuthor?.user_id;

    if (blogAuthorId && blogAuthorId !== user_id) {
      await Notification.create(
        {
          type: replying_to ? "reply" : "comment",
          blog: trimmedBlogId,
          notification_for: blogAuthorId,
          user: user_id,
          comment_id: newComment.comment_id,
          reply: replying_to ? newComment.comment_id : null,
          replied_on_comment: replying_to ? parentComment.comment_id : null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { transaction }
      );
    }

    // 8. If this is a reply, also notify the parent comment author (if different from blog author and commenter)
    if (replying_to && parentComment) {
      const parentCommentAuthorId = parentComment.commented_by;

      if (
        parentCommentAuthorId &&
        parentCommentAuthorId !== user_id &&
        parentCommentAuthorId !== blogAuthorId
      ) {
        await Notification.create(
          {
            type: "reply",
            blog: trimmedBlogId,
            notification_for: parentCommentAuthorId,
            user: user_id,
            comment_id: newComment.comment_id,
            reply: newComment.comment_id,
            replied_on_comment: parentComment.comment_id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          { transaction }
        );
      }
    }

    // 9. Get updated total comments count
    const total_comments = await Comment.count({
      where: { blog_id: trimmedBlogId },
      transaction,
    });

    await transaction.commit();

    console.log("Comment created successfully:", {
      comment_id,
      blog_id: trimmedBlogId,
      isReply: !!replying_to,
      total_comments,
    });

    // 10. Return the created comment with user info
    return res.json({
      success: true,
      message: replying_to
        ? "Reply added successfully"
        : "Comment added successfully",
      comment: {
        comment_id: newComment.comment_id,
        blog_id: newComment.blog_id,
        comment: newComment.comment,
        commented_by: newComment.commented_by,
        isReply: newComment.isReply,
        parent_comment_id: newComment.parent_comment_id,
        children: newComment.children,
        createdAt: newComment.createdAt,
        commentAuthor: {
          user_id: user.user_id,
          fullname: user.fullname,
          username: user.username,
          profile_img: user.profile_img,
        },
      },
      total_comments,
    });
  } catch (err) {
    await transaction.rollback();

    console.error("Comment operation failed:", {
      errorName: err.name,
      errorMessage: err.message,
      validationErrors: err.errors?.map((e) => e.message),
      stack: err.stack,
    });

    const errorResponse = {
      success: false,
      message: "Error adding comment",
    };

    if (err.name === "SequelizeValidationError") {
      errorResponse.error = "Data validation failed";
      errorResponse.details = err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      }));
    } else if (err.name === "SequelizeForeignKeyConstraintError") {
      errorResponse.error = "Invalid reference (blog or user doesn't exist)";
    } else if (err.name === "SequelizeUniqueConstraintError") {
      errorResponse.error = "Duplicate comment ID generated";
    } else {
      errorResponse.error = "Database operation failed";
    }

    if (process.env.NODE_ENV === "development") {
      errorResponse.debug = {
        error: err.name,
        message: err.message,
      };
    }

    return res.status(500).json(errorResponse);
  }
});

// IMPROVED: Get replies for a specific comment with better pagination
server.post("/get-comment-replies", async (req, res) => {
  const { comment_id, skip = 0 } = req.body;
  const maxLimit = 5;

  if (!comment_id || typeof comment_id !== "string") {
    return res.status(400).json({
      success: false,
      error: "comment_id is required and must be a string",
    });
  }

  try {
    // Get direct replies to the comment
    const replies = await Comment.findAll({
      where: {
        parent_comment_id: comment_id,
        isReply: true,
      },
      include: [
        {
          model: User,
          as: "commentedBy",
          attributes: ["user_id", "username", "fullname", "profile_img"],
          required: true,
        },
      ],
      attributes: [
        "comment_id",
        "blog_id",
        "comment",
        "commented_by",
        "isReply",
        "parent_comment_id",
        "children",
        "createdAt",
        "updatedAt",
      ],
      order: [["createdAt", "ASC"]], // Oldest replies first
      offset: parseInt(skip),
      limit: maxLimit,
    });

    // Get total count of replies for this comment
    const totalReplies = await Comment.count({
      where: {
        parent_comment_id: comment_id,
        isReply: true,
      },
    });

    // Process replies to ensure children array is properly formatted
    const processedReplies = await Promise.all(
      replies.map(async (reply) => {
        const replyData = reply.get({ plain: true });

        // Get the actual count of replies to this reply
        const nestedRepliesCount = await Comment.count({
          where: {
            parent_comment_id: reply.comment_id,
            isReply: true,
          },
        });

        return {
          ...replyData,
          children: replyData.children || [],
          total_replies: nestedRepliesCount, // Add nested reply count
        };
      })
    );

    const currentPage = Math.floor(skip / maxLimit) + 1;
    const hasMore = skip + maxLimit < totalReplies;

    console.log(`Found ${replies.length} replies for comment ${comment_id}`, {
      skip,
      total: totalReplies,
      hasMore,
      currentPage,
    });

    return res.status(200).json({
      success: true,
      replies: processedReplies,
      pagination: {
        total: totalReplies,
        currentPage,
        hasMore,
        perPage: maxLimit,
        loaded: skip + replies.length,
        remaining: Math.max(0, totalReplies - (skip + replies.length)),
      },
    });
  } catch (err) {
    console.error("Error fetching comment replies:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch replies",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
});

// IMPROVED: Get blog comments with better reply counting
server.post("/get-blog-comments", async (req, res) => {
  const { blog_id, skip = 0 } = req.body;
  const maxLimit = 5;

  // Validate input
  if (!blog_id || typeof blog_id !== "string") {
    return res.status(400).json({
      success: false,
      error: "blog_id is required and must be a string",
    });
  }

  try {
    const trimmedBlogId = blog_id.trim();

    // Get parent comments (not replies) with author info
    const comments = await Comment.findAll({
      where: {
        blog_id: trimmedBlogId,
        isReply: false, // Only get parent comments, not replies
      },
      include: [
        {
          model: User,
          as: "commentedBy",
          attributes: ["user_id", "username", "fullname", "profile_img"],
          required: true,
        },
      ],
      attributes: [
        "comment_id",
        "blog_id",
        "comment",
        "commented_by",
        "children",
        "isReply",
        "parent_comment_id",
        "createdAt",
        "updatedAt",
      ],
      order: [["createdAt", "DESC"]], // Latest comments first
      offset: parseInt(skip),
      limit: maxLimit,
    });

    // Get total count of parent comments for pagination
    const totalComments = await Comment.count({
      where: {
        blog_id: trimmedBlogId,
        isReply: false,
      },
    });

    // Process comments to ensure proper data structure and get accurate reply counts
    const processedComments = await Promise.all(
      comments.map(async (comment) => {
        const commentData = comment.get({ plain: true });

        // Get actual reply count for this comment (direct replies only)
        const totalRepliesCount = await Comment.count({
          where: {
            parent_comment_id: comment.comment_id,
            isReply: true,
          },
        });

        return {
          ...commentData,
          children: commentData.children || [],
          total_replies: totalRepliesCount, // Add accurate reply count
        };
      })
    );

    const currentPage = Math.floor(skip / maxLimit) + 1;
    const hasMore = skip + maxLimit < totalComments;

    console.log(`Found ${comments.length} comments for blog ${trimmedBlogId}`, {
      skip,
      total: totalComments,
      hasMore,
      currentPage,
    });

    return res.status(200).json({
      success: true,
      comments: processedComments,
      pagination: {
        total: totalComments,
        currentPage,
        hasMore,
        perPage: maxLimit,
        loaded: skip + comments.length,
        remaining: Math.max(0, totalComments - (skip + comments.length)),
      },
    });
  } catch (err) {
    console.error("Error fetching blog comments:", {
      errorName: err.name,
      errorMessage: err.message,
      blog_id,
      skip,
    });

    return res.status(500).json({
      success: false,
      error: "Failed to fetch comments",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
});

// ENHANCED: Get nested replies with better pagination and depth control
server.post("/get-nested-replies", async (req, res) => {
  const { comment_id, max_depth = 2, skip = 0, limit = 5 } = req.body;

  if (!comment_id || typeof comment_id !== "string") {
    return res.status(400).json({
      success: false,
      error: "comment_id is required and must be a string",
    });
  }

  try {
    // Recursive function to get nested replies with pagination
    const getNestedReplies = async (
      parentId,
      currentDepth = 0,
      skipCount = 0,
      limitCount = limit
    ) => {
      if (currentDepth >= max_depth) {
        return { replies: [], hasMore: false, total: 0 };
      }

      const replies = await Comment.findAll({
        where: {
          parent_comment_id: parentId,
          isReply: true,
        },
        include: [
          {
            model: User,
            as: "commentedBy",
            attributes: ["user_id", "username", "fullname", "profile_img"],
            required: true,
          },
        ],
        attributes: [
          "comment_id",
          "blog_id",
          "comment",
          "commented_by",
          "isReply",
          "parent_comment_id",
          "children",
          "createdAt",
          "updatedAt",
        ],
        order: [["createdAt", "ASC"]],
        offset: skipCount,
        limit: limitCount,
      });

      const totalReplies = await Comment.count({
        where: {
          parent_comment_id: parentId,
          isReply: true,
        },
      });

      // For each reply, get its nested replies (if within depth limit)
      const nestedReplies = [];
      for (const reply of replies) {
        const replyData = reply.get({ plain: true });

        let childReplies = [];
        let childrenMeta = { hasMore: false, total: 0 };

        if (currentDepth + 1 < max_depth) {
          const childResult = await getNestedReplies(
            reply.comment_id,
            currentDepth + 1,
            0,
            3
          ); // Load fewer nested replies
          childReplies = childResult.replies;
          childrenMeta = {
            hasMore: childResult.hasMore,
            total: childResult.total,
          };
        }

        nestedReplies.push({
          ...replyData,
          children: replyData.children || [],
          nested_replies: childReplies,
          children_meta: childrenMeta,
          reply_depth: currentDepth + 1,
        });
      }

      return {
        replies: nestedReplies,
        hasMore: skipCount + limitCount < totalReplies,
        total: totalReplies,
      };
    };

    const result = await getNestedReplies(comment_id, 0, skip, limit);

    return res.status(200).json({
      success: true,
      nested_replies: result.replies,
      pagination: {
        hasMore: result.hasMore,
        total: result.total,
        loaded: skip + result.replies.length,
        remaining: Math.max(0, result.total - (skip + result.replies.length)),
      },
      max_depth_used: max_depth,
    });
  } catch (err) {
    console.error("Error fetching nested replies:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch nested replies",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
});

// Bulk delete comments (optional - for admin purposes)
server.delete("/delete-comments-bulk", verifyJWT, async (req, res) => {
  const { comment_ids, blog_id } = req.body;
  const user_id = req.user;

  // Validate input
  if (!comment_ids || !Array.isArray(comment_ids) || comment_ids.length === 0) {
    return res.status(400).json({
      success: false,
      error: "comment_ids must be a non-empty array",
    });
  }

  if (!blog_id || typeof blog_id !== "string") {
    return res.status(400).json({
      success: false,
      error: "blog_id is required and must be a string",
    });
  }

  const transaction = await sequelize.transaction();

  try {
    // Check if user is the blog author (only blog author can bulk delete)
    const blog = await Blog.findOne({
      where: { blog_id: blog_id.trim() },
      attributes: ["author"],
      transaction,
    });

    if (!blog) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: "Blog not found",
      });
    }

    // Check authorization - only blog author can bulk delete comments
    if (blog.author !== user_id) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        error: "Only blog authors can bulk delete comments",
      });
    }

    // Get all comments to be deleted
    const commentsToDelete = await Comment.findAll({
      where: {
        comment_id: {
          [Op.in]: comment_ids,
        },
        blog_id: blog_id.trim(),
      },
      attributes: ["comment_id", "children", "isReply"],
      transaction,
    });

    if (commentsToDelete.length === 0) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: "No comments found to delete",
      });
    }

    // Collect all comment IDs including replies
    const allCommentIds = [];
    commentsToDelete.forEach((comment) => {
      allCommentIds.push(comment.comment_id);
      if (comment.children && comment.children.length > 0) {
        allCommentIds.push(...comment.children);
      }
    });

    // Delete all comments and replies
    await Comment.destroy({
      where: {
        comment_id: {
          [Op.in]: allCommentIds,
        },
      },
      transaction,
    });

    // Delete related notifications
    await Notification.destroy({
      where: {
        [Op.or]: [
          { comment_id: { [Op.in]: allCommentIds } },
          { reply: { [Op.in]: allCommentIds } },
          { replied_on_comment: { [Op.in]: allCommentIds } },
        ],
      },
      transaction,
    });

    // Get updated total comments count
    const total_comments = await Comment.count({
      where: { blog_id: blog_id.trim() },
      transaction,
    });

    await transaction.commit();

    console.log("Bulk comment deletion successful:", {
      deleted_count: allCommentIds.length,
      blog_id: blog_id.trim(),
      total_comments,
    });

    return res.json({
      success: true,
      message: `Successfully deleted ${allCommentIds.length} comments`,
      deleted_count: allCommentIds.length,
      blog_id: blog_id.trim(),
      total_comments,
    });
  } catch (err) {
    await transaction.rollback();

    console.error("Bulk comment deletion failed:", {
      errorName: err.name,
      errorMessage: err.message,
    });

    return res.status(500).json({
      success: false,
      message: "Error deleting comments",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Database operation failed",
    });
  }
});

server.post("/update-profile-img", verifyJWT, async (req, res) => {
  try {
    const { profile_img } = req.body;
    const user_id = req.user;

    if (!profile_img) {
      return res.status(400).json({ error: "Profile image URL is required" });
    }

    await User.update({ profile_img }, { where: { user_id } });

    return res.status(200).json({
      message: "Profile image updated successfully",
      profile_img,
    });
  } catch (err) {
    console.error("Error updating profile image:", err);
    return res.status(500).json({
      error: "Failed to update profile image",
      details: process.env.NODE_ENV === "development" ? err.message : null,
    });
  }
});
server.post("/update-profile", verifyJWT, async (req, res) => {
  try {
    const user_id = req.user;
    const {
      username,
      bio,
      facebook,
      instagram,
      twitter,
      youtube,
      github,
      website,
      personal_city,
      personal_country,
      personal_state,
      personal_street,
      personal_zip_code,
      profession_id, // Keep for backward compatibility
      // NEW FIELDS for hierarchy selection
      domain_id,      // Level 0 profession
      field_id,       // Level 1 profession  
      specialty_id,   // Level 2 profession
      professional_city,
      professional_country,
      professional_state,
      professional_street,
      professional_zip_code,
    } = req.body;

    // Validate username
    if (!username || username.length < 3) {
      return res
        .status(400)
        .json({ error: "Username must be at least 3 characters" });
    }

    // Check if username is already taken by another user
    const existingUser = await User.findOne({
      where: {
        username,
        user_id: { [Op.ne]: user_id },
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    // Validate social URLs if provided
    const validateUrl = (url) => {
      if (!url) return true;
      try {
        new URL(url.startsWith("http") ? url : `https://${url}`);
        return true;
      } catch {
        return false;
      }
    };

    if (facebook && !validateUrl(facebook)) {
      return res.status(400).json({ error: "Invalid Facebook URL" });
    }
    if (instagram && !validateUrl(instagram)) {
      return res.status(400).json({ error: "Invalid Instagram URL" });
    }
    if (twitter && !validateUrl(twitter)) {
      return res.status(400).json({ error: "Invalid Twitter URL" });
    }
    if (youtube && !validateUrl(youtube)) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }
    if (github && !validateUrl(github)) {
      return res.status(400).json({ error: "Invalid GitHub URL" });
    }
    if (website && !validateUrl(website)) {
      return res.status(400).json({ error: "Invalid Website URL" });
    }
     // Handle profession hierarchy and profile_id generation
    let finalProfessionId = profession_id;
    let profile_id = null;

    // If domain->field->specialty selection is provided, use that
    if (domain_id && field_id && specialty_id) {
      try {
        const { generateProfileId } = await import('./utils/profileIdGenerator.js');
        const professionResult = await generateProfileId(
          domain_id,
          field_id,
          specialty_id
        );
        
        profile_id = professionResult.profile_id;
        finalProfessionId = specialty_id; // Store the most specific profession

      } catch (error) {
        console.error('Error generating profile_id:', error);
        return res.status(400).json({ 
          error: "Invalid profession selection", 
          details: error.message 
        });
      }
    }

    // Prepare update data
    const updateData = {
      username,
      bio,
      facebook: facebook || null,
      instagram: instagram || null,
      twitter: twitter || null,
      youtube: youtube || null,
      github: github || null,
      website: website || null,
      personal_city: personal_city || null,
      personal_country: personal_country || null,
      personal_state: personal_state || null,
      personal_street: personal_street || null,
      personal_zip_code: personal_zip_code || null,
      profession_id: finalProfessionId || null,
      professional_city: professional_city || null,
      professional_country: professional_country || null,
      professional_state: professional_state || null,
      professional_street: professional_street || null,
      professional_zip_code: professional_zip_code || null,
    };

    // Only update profile_id if it was generated
    if (profile_id !== null) {
      updateData.profile_id = profile_id;
    }

    // Update user profile
    await User.update(updateData, {
      where: { user_id },
      returning: true,
      plain: true,
    });

    // Get updated user data
    const updatedUser = await User.findOne({
      where: { user_id },
      attributes: { exclude: ["password", "google_auth"] },
    });

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    return res.status(500).json({
      error: "Failed to update profile",
      details: process.env.NODE_ENV === "development" ? err.message : null,
    });
  }
});

server.delete("/delete-notification", verifyJWT, async (req, res) => {
  // Validate request body structure first
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({
      success: false,
      message: "Invalid request format",
      error: "Expected JSON object",
    });
  }

  const { notification_id } = req.body;
  const user_id = req.user;

  // Validate input
  if (
    !notification_id ||
    (typeof notification_id !== "string" && typeof notification_id !== "number")
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid notification ID",
      error: "notification_id must be a non-empty string or number",
    });
  }

  const transaction = await sequelize.transaction();

  try {
    console.log("Processing delete notification action:", {
      notification_id,
      user_id,
    });

    // 1. Find the notification
    const notification = await Notification.findOne({
      where: {
        id: notification_id,
        notification_for: user_id, // Ensure user can only delete their own notifications
      },
      attributes: ["id", "type", "notification_for"],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!notification) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error:
          "Notification not found or you don't have permission to delete it",
      });
    }

    // 2. Check if user is authorized to delete this notification
    if (notification.notification_for !== user_id) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        error: "You can only delete your own notifications",
      });
    }

    // 3. Delete the notification
    await Notification.destroy({
      where: { id: notification_id },
      transaction,
    });

    await transaction.commit();

    console.log("Notification deleted successfully:", {
      notification_id,
      user_id,
      type: notification.type,
    });

    return res.json({
      success: true,
      message: "Notification deleted successfully",
      deleted_notification_id: notification_id,
    });
  } catch (err) {
    await transaction.rollback();

    console.error("Notification deletion failed:", {
      errorName: err.name,
      errorMessage: err.message,
      stack: err.stack,
    });

    const errorResponse = {
      success: false,
      message: "Error deleting notification",
    };

    if (err.name === "SequelizeForeignKeyConstraintError") {
      errorResponse.error =
        "Cannot delete notification due to database constraints";
    } else {
      errorResponse.error = "Database operation failed";
    }

    if (process.env.NODE_ENV === "development") {
      errorResponse.debug = {
        error: err.name,
        message: err.message,
      };
    }

    return res.status(500).json(errorResponse);
  }
});

// CORRECTED: Main notifications endpoint
server.post("/notifications", verifyJWT, async (req, res) => {
  const user_id = req.user;
  const { page = 1, filter = "all", deletedDocCount = 0 } = req.body;
  const maxLimit = 10;

  try {
    const offset = Math.max(0, (page - 1) * maxLimit - deletedDocCount);

    // CORRECTED: Base where clause to properly include own replies
    let whereClause = {
      [Op.or]: [
        // Case 1: All notifications FOR the user FROM others
        {
          notification_for: user_id,
          user: { [Op.ne]: user_id },
        },
        // Case 2: Own replies (notifications where user replied to someone else's comment)
        {
          notification_for: user_id,
          user: user_id,
          type: "reply",
        },
      ],
    };

    // CORRECTED: Apply filter logic
    if (filter !== "all") {
      if (filter === "reply") {
        // Show all replies: others' replies to user + user's own replies
        whereClause = {
          notification_for: user_id,
          type: "reply",
        };
      } else {
        // For like/comment filters: only show others' notifications
        whereClause = {
          notification_for: user_id,
          type: filter,
          user: { [Op.ne]: user_id },
        };
      }
    }

    console.log(
      "Notification whereClause:",
      JSON.stringify(whereClause, null, 2)
    );
    console.log("User ID:", user_id, "Filter:", filter);

    const { count: total, rows: notifications } =
      await Notification.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: "notificationUser",
            attributes: ["user_id", "username", "fullname", "profile_img"],
            required: true,
          },
          {
            model: Blog,
            as: "notificationBlog",
            attributes: ["blog_id", "title"],
            required: false,
          },
          {
            model: Comment,
            as: "notificationComment",
            attributes: ["comment_id", "comment"],
            required: false,
          },
        ],
        attributes: [
          "id",
          "type",
          "seen",
          "reply",
          "replied_on_comment",
          "user",
          "comment_id",
          "blog",
          "createdAt",
        ],
        order: [["createdAt", "DESC"]],
        offset: offset,
        limit: maxLimit,
        distinct: true,
      });

    console.log(`Found ${notifications.length} notifications`);
    console.log(
      "Notifications with ownership:",
      notifications.slice(0, 3).map((n) => ({
        id: n.id,
        type: n.type,
        user: n.user,
        notification_for: n.notification_for,
        isOwn: n.user === user_id,
      }))
    );

    const validNotifications = notifications.filter(
      (n) => n.notificationBlog !== null
    );

    const formattedNotifications = await Promise.all(
      validNotifications.map(async (notification) => {
        const plainNotif = notification.get({ plain: true });

        let originalComment = null;

        if (plainNotif.type === "reply" && plainNotif.replied_on_comment) {
          try {
            originalComment = await Comment.findOne({
              where: { comment_id: plainNotif.replied_on_comment },
              attributes: ["comment_id", "comment"],
            });

            if (originalComment) {
              originalComment = originalComment.get({ plain: true });
            }
          } catch (err) {
            console.error("Error fetching original comment:", err);
          }
        }

        // CORRECTED: Properly identify own replies
        const isOwnReply =
          plainNotif.user === user_id && plainNotif.type === "reply";

        return {
          _id: plainNotif.id,
          type: plainNotif.type,
          seen: plainNotif.seen,
          reply: plainNotif.reply,
          replied_on_comment: plainNotif.replied_on_comment,
          original_comment: originalComment,
          createdAt: plainNotif.createdAt,
          user: plainNotif.notificationUser,
          blog: plainNotif.notificationBlog,
          comment: plainNotif.notificationComment,
          comment_id: plainNotif.comment_id,
          isOwnReply: isOwnReply,
          // Add these flags for better frontend handling
          canDelete: isOwnReply, // Only own replies can be deleted
          isDeletable: isOwnReply,
        };
      })
    );

    // CORRECTED: Only mark others' notifications as seen (not own replies)
    const unseenOthersNotifications = validNotifications
      .filter((n) => n.user !== user_id && !n.seen)
      .map((n) => n.id);

    if (unseenOthersNotifications.length > 0) {
      await Notification.update(
        { seen: true },
        { where: { id: { [Op.in]: unseenOthersNotifications } } }
      );
    }

    return res.status(200).json({
      notifications: formattedNotifications,
      totalDocs: validNotifications.length,
      currentPage: parseInt(page),
      perPage: maxLimit,
      totalPages: Math.ceil(validNotifications.length / maxLimit),
      debug:
        process.env.NODE_ENV === "development"
          ? {
              whereClause,
              offset,
              totalFound: notifications.length,
              validCount: validNotifications.length,
              ownRepliesCount: formattedNotifications.filter(
                (n) => n.isOwnReply
              ).length,
              othersNotificationsCount: formattedNotifications.filter(
                (n) => !n.isOwnReply
              ).length,
            }
          : undefined,
    });
  } catch (err) {
    console.error("Error fetching notifications:", {
      error: err.message,
      stack: err.stack,
      body: req.body,
    });
    return res.status(500).json({
      error: "Failed to fetch notifications",
      details: process.env.NODE_ENV === "development" ? err.message : null,
    });
  }
});

// FIXED: Count endpoint
server.post("/all-notifications-count", verifyJWT, async (req, res) => {
  const user_id = req.user;
  const { filter = "all" } = req.body;

  try {
    let whereClause = {
      notification_for: user_id,
      [Op.or]: [
        { user: { [Op.ne]: user_id } },
        { user: user_id, type: "reply" },
      ],
    };

    if (filter !== "all") {
      if (filter === "reply") {
        whereClause = {
          notification_for: user_id,
          type: "reply",
        };
      } else {
        whereClause = {
          notification_for: user_id,
          type: filter,
          user: { [Op.ne]: user_id },
        };
      }
    }

    const count = await Notification.count({
      where: whereClause,
    });

    console.log("Notification count:", count, "for filter:", filter);

    return res.status(200).json({ totalDocs: count });
  } catch (err) {
    console.error("Error counting notifications:", err);
    return res.status(500).json({
      error: "Failed to count notifications",
      details: process.env.NODE_ENV === "development" ? err.message : null,
    });
  }
});

// 4. ADD NEW DELETE COMMENT ENDPOINT
server.delete("/delete-comment", verifyJWT, async (req, res) => {
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({
      success: false,
      message: "Invalid request format",
      error: "Expected JSON object",
    });
  }

  const { comment_id } = req.body;
  const user_id = req.user;

  if (!comment_id || typeof comment_id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid comment ID",
      error: "comment_id must be a non-empty string",
    });
  }

  const transaction = await sequelize.transaction();

  try {
    console.log("Processing delete comment action:", {
      comment_id,
      user_id,
    });

    // 1. Find and verify ownership
    const comment = await Comment.findOne({
      where: {
        comment_id,
        commented_by: user_id, // Ensure user can only delete their own comments
      },
      attributes: [
        "comment_id",
        "commented_by",
        "parent_comment_id",
        "children",
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!comment) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: "Comment not found or you don't have permission to delete it",
      });
    }

    // 2. If this comment has a parent, remove it from parent's children array
    if (comment.parent_comment_id) {
      const parentComment = await Comment.findOne({
        where: { comment_id: comment.parent_comment_id },
        attributes: ["comment_id", "children"],
        transaction,
      });

      if (parentComment && parentComment.children) {
        const updatedChildren = parentComment.children.filter(
          (child) => child !== comment_id
        );

        await Comment.update(
          { children: updatedChildren },
          {
            where: { comment_id: comment.parent_comment_id },
            transaction,
          }
        );
      }
    }

    // 3. Delete any child comments (if this comment has replies)
    if (comment.children && comment.children.length > 0) {
      await Comment.destroy({
        where: { comment_id: { [Op.in]: comment.children } },
        transaction,
      });

      // Delete notifications for child comments
      await Notification.destroy({
        where: { comment_id: { [Op.in]: comment.children } },
        transaction,
      });
    }

    // 4. Delete the comment itself
    await Comment.destroy({
      where: { comment_id },
      transaction,
    });

    // 5. Delete associated notifications
    await Notification.destroy({
      where: { comment_id },
      transaction,
    });

    await transaction.commit();

    console.log("Comment deleted successfully:", {
      comment_id,
      user_id,
    });

    return res.json({
      success: true,
      message: "Comment deleted successfully",
      deleted_comment_id: comment_id,
    });
  } catch (err) {
    await transaction.rollback();

    console.error("Comment deletion failed:", {
      errorName: err.name,
      errorMessage: err.message,
      stack: err.stack,
    });

    const errorResponse = {
      success: false,
      message: "Error deleting comment",
    };

    if (err.name === "SequelizeForeignKeyConstraintError") {
      errorResponse.error = "Cannot delete comment due to database constraints";
    } else {
      errorResponse.error = "Database operation failed";
    }

    if (process.env.NODE_ENV === "development") {
      errorResponse.debug = {
        error: err.name,
        message: err.message,
      };
    }

    return res.status(500).json(errorResponse);
  }
});

server.post("/verify-email-otp", async (req, res) => {
  const { email, otp } = req.body;
  const pending = pendingSignups[email];
  if (!pending)
    return res.status(404).json({ error: "Signup not found or expired" });
  if (pending.otp === otp && pending.otpExpires > new Date()) {
    pending.otpVerified = true;
    return res.json({ success: true });
  } else {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }
});

server.post("/complete-signup", async (req, res) => {
  const { email } = req.body;
  const pending = pendingSignups[email];
  if (!pending)
    return res.status(404).json({ error: "Signup not found or expired" });
  if (!pending.otpVerified)
    return res.status(400).json({ error: "OTP not verified" });
  try {
    // Double-check email/mobile uniqueness
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email: pending.email },
          { mobile_number: pending.mobile_number },
        ],
      },
    });
    if (existingUser) {
      if (existingUser.email === pending.email) {
        return res.status(400).json({ error: "❌ Email already exists" });
      }
      if (existingUser.mobile_number === pending.mobile_number) {
        return res
          .status(400)
          .json({ error: "❌ Mobile number already exists" });
      }
    }
    let user = await User.create({
      first_name: pending.first_name,
      last_name: pending.last_name,
      email: pending.email,
      password: pending.password,
      username: pending.username,
      mobile_number: pending.mobile_number,
      google_auth: false,
      customer_id: pending.customer_id,
      country_code: pending.country_code,
      state_code: pending.state_code,
      district_code: pending.district_code,
      block_code: pending.block_code,
      village_code: pending.village_code,
      latitude: pending.latitude,
      longitude: pending.longitude,
    });
    // Log IP address for signup
    const ip_address = getClientIp(req);
    if (user && ip_address) {
      await UserIPHistory.create({
        user_id: user.user_id,
        ip_address,
        created_at: new Date(),
      });
    }
    delete pendingSignups[email]; // Clean up
    return res.status(200).json({
      ...formatDatatoSend(user),
      customer_id: pending.customer_id,
      abbr: pending.abbr,
    });
  } catch (error) {
    console.error("Complete signup error:", error);
    return res
      .status(500)
      .json({ error: "❌ Server error during account creation" });
  }
});

// --- LOCATION TRACKING ENDPOINTS ---

// POST /update-location
server.post("/update-location", verifyJWT, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const user_id = req.user;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({
        error: "Latitude and longitude are required and must be numbers",
      });
    }
    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({ error: "Invalid latitude" });
    }
    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({ error: "Invalid longitude" });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await user.update({
      current_latitude: latitude,
      current_longitude: longitude,
      location_updated_at: new Date()
    });
    return res.status(200).json({
      message: "Location updated successfully",
      location: { latitude, longitude },
    });
  } catch (error) {
    console.error("Error updating location:", error);
    return res.status(500).json({ error: "Failed to update location" });
  }
});

// POST /toggle-location-privacy
server.post("/toggle-location-privacy", verifyJWT, async (req, res) => {
  try {
    const user_id = req.user;
    const { is_public } = req.body;
    if (typeof is_public !== "boolean") {
      return res.status(400).json({ error: "is_public must be a boolean" });
    }
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await user.update({ is_location_public: is_public });
    return res.status(200).json({
      message: `Location is now ${is_public ? "public" : "private"}`,
      is_location_public: is_public,
    });
  } catch (error) {
    console.error("Error toggling location privacy:", error);
    return res.status(500).json({ error: "Failed to update location privacy" });
  }
});

// POST /find-nearby-users
server.post("/find-nearby-users", async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      radius_km = 10,
      profession_id = null,
      limit = 20,
      include_non_public = false,
    } = req.body;
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({
        error: "Latitude and longitude are required and must be numbers",
      });
    }
    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({ error: "Invalid coordinates" });
    }
    const Op = sequelize.Sequelize.Op;
    const haversinePublic = sequelize.literal(`
      (6371 * acos(
        cos(radians(${latitude})) * 
        cos(radians(current_latitude)) * 
        cos(radians(current_longitude) - radians(${longitude})) + 
        sin(radians(${latitude})) * 
        sin(radians(current_latitude))
      ))
    `);
    let users = await User.findAll({
      where: {
        is_location_public: true,
        current_latitude: { [Op.ne]: null },
        current_longitude: { [Op.ne]: null },
        ...(profession_id ? { profession_id } : {})
      },
      attributes: [
        "fullname",
        "username",
        "profile_img",
        "bio",
        "profile_id",
        "profession_id",
        [haversinePublic, 'distance']
      ],
      include: [
        {
          model: Profession,
          as: 'profession',
          attributes: ['name']
        }
      ],
      having: sequelize.literal(`distance <= ${radius_km}`),
      order: [['distance', 'ASC']],
      limit
    });
    if ((!users || users.length === 0) && include_non_public === true) {
      const haversine = sequelize.literal(`
        (6371 * acos(
          cos(radians(${latitude})) * 
          cos(radians(current_latitude)) * 
          cos(radians(current_longitude) - radians(${longitude})) + 
          sin(radians(${latitude})) * 
          sin(radians(current_latitude))
        ))
      `);
      users = await User.findAll({
        where: {
          current_latitude: { [Op.ne]: null },
          current_longitude: { [Op.ne]: null },
          ...(profession_id ? { profession_id } : {})
        },
        attributes: [
          "fullname",
          "username",
          "profile_img",
          "bio",
          "profile_id",
          "profession_id",
          [haversine, 'distance']
        ],
        include: [
          {
            model: Profession,
            as: 'profession',
            attributes: ['name']
          }
        ],
        having: sequelize.literal(`distance <= ${radius_km}`),
        order: [['distance', 'ASC']],
        limit
      });
    }
    return res.status(200).json({
      users,
      count: users.length,
      search_radius: radius_km,
    });
  } catch (error) {
    console.error("Error finding nearby users:", error);
    return res.status(500).json({ error: "Failed to find nearby users" });
  }
});

// --- PROFILE ID MANAGEMENT ENDPOINTS ---

// Get all domains (level 0)
server.get("/professions/domains", async (req, res) => {
  try {
    const domains = await Profession.findAll({
      where: { 
        level: 0, 
        parent_id: null 
      },
      order: [['name', 'ASC']]
    });

    return res.status(200).json({
      message: "Domains retrieved successfully",
      data: domains
    });
  } catch (error) {
    console.error("Error getting domains:", error);
    return res.status(500).json({
      error: "Failed to retrieve domains",
      details: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
});
// Get fields by domain_id
server.get("/professions/fields/:domain_id", async (req, res) => {
  try {
    const { domain_id } = req.params;
    
    const fields = await Profession.findAll({
      where: { 
        level: 1, 
        parent_id: domain_id 
      },
      order: [['name', 'ASC']]
    });

    return res.status(200).json({
      message: "Fields retrieved successfully",
      data: fields
    });
  } catch (error) {
    console.error("Error getting fields:", error);
    return res.status(500).json({
      error: "Failed to retrieve fields",
      details: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
});

// Get specialties by field_id
server.get("/professions/specialties/:field_id", async (req, res) => {
  try {
    const { field_id } = req.params;
    const { Op } = await import('sequelize');
    
    // Get detailed occupations (level 3) instead of broad groups (level 2)
    const specialties = await Profession.findAll({
      where: { 
        level: 3,
        parent_id: {
          [Op.in]: sequelize.literal(`(
            SELECT profession_id FROM Professions 
            WHERE level = 2 AND parent_id = ${field_id}
          )`)
        }
      },
      order: [['name', 'ASC']]
    });

    return res.status(200).json({
      message: "Specialties retrieved successfully",
      data: specialties
    });
  } catch (error) {
    console.error("Error getting specialties:", error);
    return res.status(500).json({
      error: "Failed to retrieve specialties",
      details: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
});

// Get profession details by profile_id
server.get("/professions/profile/:profile_id", async (req, res) => {
  try {
    const { profile_id } = req.params;
    const professionDetails = await getProfessionNamesFromProfileId(profile_id);
    
    return res.status(200).json({
      message: "Profession details retrieved successfully",
      data: professionDetails
    });
  } catch (error) {
    console.error("Error getting profession by profile_id:", error);
    return res.status(400).json({
      error: "Failed to retrieve profession details",
      details: error.message
    });
  }
});

// Import profession data from JSON file (admin endpoint)
server.post("/professions/import", async (req, res) => {
  try {
    const { importProfessionData } = await import('../utils/import-profession-data.js');
    const result = await importProfessionData();
    
    return res.status(200).json({
      message: "Profession data imported successfully",
      data: result
    });
  } catch (error) {
    console.error("Error importing profession data:", error);
    return res.status(500).json({
      error: "Failed to import profession data",
      details: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
});

        // Get profession statistics
        server.get("/professions/stats", async (req, res) => {
          try {
            const { getProfessionStats } = await import('../utils/import-profession-data.js');
            const stats = await getProfessionStats();
            
            return res.status(200).json({
              message: "Profession statistics retrieved successfully",
              data: stats
            });
          } catch (error) {
            console.error("Error getting profession stats:", error);
            return res.status(500).json({
              error: "Failed to retrieve profession statistics",
              details: process.env.NODE_ENV === "development" ? error.message : null,
            });
          }
        });

        // Search professions for suggestions
        server.get("/professions/search", async (req, res) => {
          try {
            const { query, level } = req.query;
            
            if (!query || query.trim().length < 2) {
              return res.status(400).json({
                error: "Search query must be at least 2 characters long"
              });
            }

            const { Profession } = await import('./Schema/associations.js');
            const { Op } = await import('sequelize');

            const whereClause = {
              name: {
                [Op.like]: `%${query.trim()}%`
              }
            };

            if (level !== undefined) {
              whereClause.level = parseInt(level);
            }

            const results = await Profession.findAll({
              where: whereClause,
              limit: 10,
              order: [['name', 'ASC']]
            });

            return res.status(200).json({
              message: "Profession search completed successfully",
              data: results
            });
          } catch (error) {
            console.error("Error searching professions:", error);
            return res.status(500).json({
              error: "Failed to search professions",
              details: process.env.NODE_ENV === "development" ? error.message : null,
            });
          }
        });
// Import profession data on startup if not already imported
const initializeProfessionData = async () => {
  try {
    const { getProfessionStats } = await import('./utils/import-profession-data.js');
    const stats = await getProfessionStats();
    
    if (stats.total === 0) {
      console.log('📊 No profession data found. Importing from JSON file...');
      const { importProfessionData } = await import('./utils/import-profession-data.js');
      await importProfessionData();
      console.log('✅ Profession data imported successfully');
    } else {
      console.log(`📊 Profession data already loaded: ${stats.domains} domains, ${stats.fields} fields, ${stats.specialties} specialties`);
    }
  } catch (error) {
    console.error('❌ Error initializing profession data:', error);
  }
};

// ==================== DONOR & DONATION API ENDPOINTS ====================

// Create Razorpay order (amount in INR)
server.post("/payment/create-order", verifyJWT, async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay keys not configured");
      return res.status(500).json({ error: "Razorpay keys not configured" });
    }
    
    console.log("Creating order for amount:", amount);
    const order = await razorpay.orders.create({
      amount: Math.round(parseFloat(amount) * 100),
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    });
    console.log("Order created:", order.id);
    res.json({ order });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: `Failed to create payment order: ${error.message}` });
  }
});

// Verify Razorpay signature
server.post("/payment/verify", verifyJWT, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment verification data" });
    }
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    const isValid = generatedSignature === razorpay_signature;
    res.json({ valid: isValid });
  } catch (error) {
    console.error("Error verifying payment signature:", error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

// Register as donor
server.post("/register-donor", verifyJWT, async (req, res) => {
  try {
    const { subscription_type, purpose, customer_id } = req.body;
    const user_id = req.user;

    // Check if user is already a donor
    const existingDonor = await Donor.findOne({ where: { user_id } });
    if (existingDonor) {
      return res.status(400).json({ error: "User is already registered as a donor" });
    }

    // Create donor record
    const donor = await Donor.create({
      user_id,
      customer_id: customer_id || null,
      is_subscriber: subscription_type === "repeated",
      subscription_type: subscription_type || "one-time",
      purpose: purpose || null,
    });

    res.status(201).json({ 
      message: "Successfully registered as donor", 
      donor: {
        donor_id: donor.donor_id,
        subscription_type: donor.subscription_type,
        is_subscriber: donor.is_subscriber,
        purpose: donor.purpose
      }
    });
  } catch (error) {
    console.error("Error registering donor:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get donor profile
server.get("/donor-profile", verifyJWT, async (req, res) => {
  try {
    const user_id = req.user;
    
    const donor = await Donor.findOne({ 
      where: { user_id },
      include: [{
        model: User,
        as: "user",
        attributes: ["user_id", "fullname", "email", "profile_img"]
      }]
    });

    if (!donor) {
      return res.status(404).json({ error: "Donor profile not found" });
    }

    res.json({ donor });
  } catch (error) {
    console.error("Error fetching donor profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Make a donation
server.post("/make-donation", verifyJWT, async (req, res) => {
  try {
    const { amount, purpose, customer_id, payment_id, payment_signature } = req.body;
    const user_id = req.user;

    // Check if user is a registered donor
    const donor = await Donor.findOne({ where: { user_id } });
    if (!donor) {
      return res.status(400).json({ error: "User must be registered as a donor first" });
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid donation amount is required" });
    }

    const currentDate = new Date();
    const year = currentDate.getFullYear();

    // Create donation record
    const donation = await Donation.create({
      donor_id: donor.donor_id,
      user_id,
      customer_id: customer_id || donor.customer_id,
      purpose: purpose || donor.purpose,
      amount: parseFloat(amount),
      date: currentDate,
      year,
      payment_id: payment_id || null,
      payment_signature: payment_signature || null,
      payment_status: payment_id ? 'completed' : 'pending',
    });

    res.status(201).json({ 
      message: "Donation recorded successfully", 
      donation: {
        donation_id: donation.donation_id,
        amount: donation.amount,
        purpose: donation.purpose,
        date: donation.date,
        year: donation.year
      }
    });
  } catch (error) {
    console.error("Error making donation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user's donation history
server.get("/donation-history", verifyJWT, async (req, res) => {
  try {
    const user_id = req.user;
    const { year, limit = 50 } = req.query;

    const whereClause = { user_id };
    if (year) {
      whereClause.year = parseInt(year);
    }

    const donations = await Donation.findAll({
      where: whereClause,
      include: [{
        model: Donor,
        as: "donor",
        attributes: ["subscription_type", "is_subscriber"]
      }],
      order: [["date", "DESC"]],
      limit: parseInt(limit)
    });

    res.json({ donations });
  } catch (error) {
    console.error("Error fetching donation history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add expenditure (admin only - for now, any authenticated user can add)
server.post("/add-expenditure", verifyJWT, async (req, res) => {
  try {
    const { 
      initiative, 
      amount, 
      invoice_number, 
      by_whom, 
      expense_details, 
      evidence_copy_url 
    } = req.body;

    if (!initiative || !amount || amount <= 0) {
      return res.status(400).json({ error: "Initiative and valid amount are required" });
    }

    const currentDate = new Date();
    const year = currentDate.getFullYear();

    const expenditure = await Expenditure.create({
      initiative,
      amount: parseFloat(amount),
      date: currentDate,
      year,
      invoice_number: invoice_number || null,
      by_whom: by_whom || null,
      expense_details: expense_details || null,
      evidence_copy_url: evidence_copy_url || null,
    });

    res.status(201).json({ 
      message: "Expenditure recorded successfully", 
      expenditure: {
        expenditure_id: expenditure.expenditure_id,
        initiative: expenditure.initiative,
        amount: expenditure.amount,
        date: expenditure.date,
        year: expenditure.year
      }
    });
  } catch (error) {
    console.error("Error adding expenditure:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get expenditure history
server.get("/expenditure-history", async (req, res) => {
  try {
    const { year, limit = 50 } = req.query;

    const whereClause = {};
    if (year) {
      whereClause.year = parseInt(year);
    }

    const expenditures = await Expenditure.findAll({
      where: whereClause,
      order: [["date", "DESC"]],
      limit: parseInt(limit)
    });

    res.json({ expenditures });
  } catch (error) {
    console.error("Error fetching expenditure history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add balance snapshot
server.post("/add-balance-snapshot", verifyJWT, async (req, res) => {
  try {
    const { balance_amount } = req.body;

    if (balance_amount === undefined || balance_amount < 0) {
      return res.status(400).json({ error: "Valid balance amount is required" });
    }

    const currentDate = new Date();
    const year = currentDate.getFullYear();

    const balanceSnapshot = await BalanceSnapshot.create({
      balance_amount: parseFloat(balance_amount),
      date: currentDate,
      year,
    });

    res.status(201).json({ 
      message: "Balance snapshot recorded successfully", 
      balanceSnapshot: {
        snapshot_id: balanceSnapshot.snapshot_id,
        balance_amount: balanceSnapshot.balance_amount,
        date: balanceSnapshot.date,
        year: balanceSnapshot.year
      }
    });
  } catch (error) {
    console.error("Error adding balance snapshot:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get balance history
server.get("/balance-history", async (req, res) => {
  try {
    const { year, limit = 50 } = req.query;

    const whereClause = {};
    if (year) {
      whereClause.year = parseInt(year);
    }

    const balanceSnapshots = await BalanceSnapshot.findAll({
      where: whereClause,
      order: [["date", "DESC"]],
      limit: parseInt(limit)
    });

    res.json({ balanceSnapshots });
  } catch (error) {
    console.error("Error fetching balance history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get donation analytics for profile dashboard
server.get("/donation-analytics", verifyJWT, async (req, res) => {
  try {
    const user_id = req.user;
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    // Get user's donations for the year
    const donations = await Donation.findAll({
      where: { 
        user_id,
        year: currentYear 
      },
      include: [{
        model: Donor,
        as: "donor",
        attributes: ["subscription_type"]
      }],
      order: [["date", "ASC"]]
    });

    // Calculate cumulative donations
    let cumulative = 0;
    const donationData = donations.map(donation => {
      cumulative += parseFloat(donation.amount);
      return {
        date: donation.date,
        amount: parseFloat(donation.amount),
        cumulative,
        purpose: donation.purpose,
        subscription_type: donation.donor.subscription_type
      };
    });

    // Get total donations by purpose
    const purposeTotals = await Donation.findAll({
      where: { 
        user_id,
        year: currentYear 
      },
      attributes: [
        'purpose',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
      ],
      group: ['purpose'],
      raw: true
    });

    // Get total donations by subscription type
    const subscriptionTotals = await Donation.findAll({
      where: { 
        user_id,
        year: currentYear 
      },
      include: [{
        model: Donor,
        as: "donor",
        attributes: ["subscription_type"]
      }],
      attributes: [
        [sequelize.fn('SUM', sequelize.col('Donation.amount')), 'total_amount']
      ],
      group: ['donor.subscription_type'],
      raw: true
    });

    res.json({
      donationData,
      purposeTotals,
      subscriptionTotals,
      totalDonated: cumulative,
      year: currentYear
    });
  } catch (error) {
    console.error("Error fetching donation analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get overall financial summary
server.get("/financial-summary", async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    // Get total donations for the year
    const totalDonations = await Donation.sum('amount', {
      where: { year: currentYear }
    }) || 0;

    // Get total expenditures for the year
    const totalExpenditures = await Expenditure.sum('amount', {
      where: { year: currentYear }
    }) || 0;

    // Get latest balance
    const latestBalance = await BalanceSnapshot.findOne({
      where: { year: currentYear },
      order: [["date", "DESC"]]
    });

    // Get donations by purpose
    const donationsByPurpose = await Donation.findAll({
      where: { year: currentYear },
      attributes: [
        'purpose',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
      ],
      group: ['purpose'],
      raw: true
    });

    // Get expenditures by initiative
    const expendituresByInitiative = await Expenditure.findAll({
      where: { year: currentYear },
      attributes: [
        'initiative',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
      ],
      group: ['initiative'],
      raw: true
    });

    res.json({
      year: currentYear,
      totalDonations: parseFloat(totalDonations),
      totalExpenditures: parseFloat(totalExpenditures),
      currentBalance: latestBalance ? parseFloat(latestBalance.balance_amount) : 0,
      donationsByPurpose,
      expendituresByInitiative
    });
  } catch (error) {
    console.error("Error fetching financial summary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get payment details and bank account info
server.get("/payment-details", verifyJWT, async (req, res) => {
  try {
    const { payment_id } = req.query;
    
    if (!payment_id) {
      return res.status(400).json({ error: "Payment ID is required" });
    }

    // Get donation details
    const donation = await Donation.findOne({
      where: { payment_id },
      include: [{
        model: Donor,
        as: "donor",
        include: [{
          model: User,
          as: "user",
          attributes: ["fullname", "email"]
        }]
      }]
    });

    if (!donation) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Get Razorpay payment details (if you want to fetch from Razorpay API)
    let razorpayPaymentDetails = null;
    try {
      if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        const payment = await razorpay.payments.fetch(payment_id);
        razorpayPaymentDetails = {
          status: payment.status,
          method: payment.method,
          bank: payment.bank,
          wallet: payment.wallet,
          vpa: payment.vpa,
          email: payment.email,
          contact: payment.contact,
          fee: payment.fee,
          tax: payment.tax,
          created_at: payment.created_at
        };
      }
    } catch (error) {
      console.error("Error fetching Razorpay payment details:", error);
    }

    res.json({
      donation: {
        donation_id: donation.donation_id,
        amount: donation.amount,
        purpose: donation.purpose,
        date: donation.date,
        payment_status: donation.payment_status,
        transfer_status: donation.transfer_status,
        bank_account: donation.bank_account,
        donor: donation.donor
      },
      razorpay_details: razorpayPaymentDetails,
      bank_account_info: {
        account_holder: "Connect Me Foundation", // Your organization name
        account_number: "****1234", // Masked account number
        ifsc_code: "HDFC0001234", // Your bank's IFSC
        bank_name: "HDFC Bank", // Your bank name
        branch: "Main Branch, Mumbai"
      }
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update bank account for a donation (admin function)
server.post("/update-bank-account", verifyJWT, async (req, res) => {
  try {
    const { donation_id, bank_account, transfer_status } = req.body;
    
    const donation = await Donation.findByPk(donation_id);
    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }

    await donation.update({
      bank_account: bank_account || donation.bank_account,
      transfer_status: transfer_status || donation.transfer_status
    });

    res.json({ 
      message: "Bank account updated successfully",
      donation: {
        donation_id: donation.donation_id,
        bank_account: donation.bank_account,
        transfer_status: donation.transfer_status
      }
    });
  } catch (error) {
    console.error("Error updating bank account:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Port Setup
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
  // Initialize profession data after server starts
  await initializeProfessionData();
});
