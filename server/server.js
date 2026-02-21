import dotenv from "dotenv";
dotenv.config();
// ---------------- Node.js / Core ----------------
import path from "path";
import { fileURLToPath } from "url";

// ---------------- Third-party / npm ----------------
import express from "express";

import cors from "cors";
import { Op } from "sequelize";

// ---------------- Database ----------------
import sequelize from "./config/db.config.js";

// ---------------- Service Configs ----------------
import "./config/firebase.config.js";

// ---------------- Models / Associations ----------------
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
} from "./models/associations.js";

// ---------------- Middlewares ----------------
import { verifyJWT } from "./middlewares/auth.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import userRoutes from "./routes/user.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import professionRoutes from "./routes/profession.routes.js";
import donationRoutes from "./routes/donation.routes.js";
import donorRoutes from "./routes/donor.routes.js";
import expenditureRoutes from "./routes/expenditure.routes.js";
import financeRoutes from "./routes/finance.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log("Directory name: ", __dirname);

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

// Middleware
const server = express();

server.use(express.json());
server.use(cors());

server.use("/api/auth", authRoutes);
server.use("/api/blog", blogRoutes);
server.use("/api/user", userRoutes);
server.use("/api/upload", uploadRoutes);
server.use("/api/notification", notificationRoutes);
server.use("/api/comment", commentRoutes);
server.use("/api/professions", professionRoutes);
server.use("/api/donation", donationRoutes);
server.use("/api/donor", donorRoutes);
server.use("/api/expenditure", expenditureRoutes);
server.use("/api/finance", financeRoutes);
server.use("/api/payment", paymentRoutes);

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
    await Profession.sync(syncOptions);
    await User.sync(syncOptions);
    await Blog.sync(syncOptions);
    await Comment.sync(syncOptions);
    await Notification.sync(syncOptions);
    await Like.sync(syncOptions);
    await Read.sync(syncOptions);
    await UserIPHistory.sync(syncOptions);
    await Donor.sync(syncOptions);
    await Donation.sync(syncOptions);
    // await Comment.sync({ alter: true });
    // await Notification.sync({ alter: true });
    console.log("✅ All tables are ready!");
  } catch (error) {
    console.error("❌ Database Connection Error:", error);
    process.exit(1);
  }
};

connectDB();

// In-memory store for pending signups (for demo; use Redis in production)
const pendingSignups = {};

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

//Import profession data on startup if not already imported
const initializeProfessionData = async () => {
  try {
    const { getProfessionStats } =
      await import("./utils/import-profession-data.js");
    const stats = await getProfessionStats();

    if (stats.total === 0) {
      console.log("📊 No profession data found. Importing from JSON file...");
      const { importProfessionData } =
        await import("./utils/import-profession-data.js");
      await importProfessionData();
      console.log("✅ Profession data imported successfully");
    } else {
      console.log(
        `📊 Profession data already loaded: ${stats.domains} domains, ${stats.fields} fields, ${stats.specialties} specialties`,
      );
    }
  } catch (error) {
    console.error("❌ Error initializing profession data:", error);
  }
};

// Port Setup
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);

  // Initialize profession data after server starts
  await initializeProfessionData();
});
