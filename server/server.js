import dotenv from "dotenv";
dotenv.config();

// ---------------- Node.js / Core ----------------
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

// ---------------- App ----------------
import app from "./app.js";

// ---------------- Database ----------------
import sequelize from "./config/db.config.js";

// ---------------- Service Configs ----------------
import "./config/firebase.config.js";
import { Server } from "socket.io";
import { initChatSocket } from "./sockets/chat.socket.js";
// ---------------- Models / Associations ----------------
import { User, Blog, setupAssociations } from "./models/associations.js";

// ---------------- Paths ----------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("📁 [SYSTEM] Root Directory:", __dirname);

// ================= INIT ASSOCIATIONS =================
console.log("🔗 [INIT] Setting up model associations...");
setupAssociations();
console.log(" [INIT] Associations initialized successfully");

console.log("[DEBUG] User associations:", Object.keys(User.associations));
console.log(" [DEBUG] Blog associations:", Object.keys(Blog.associations));

// ================= DB CONNECTION =================
const connectDB = async () => {
  try {
    console.log("🛢️ [DB] Connecting to MySQL...");

    await sequelize.authenticate();
    console.log(" [DB] Connection established");

    console.log("[DB] Syncing database models...");
    await sequelize.sync({
      alter: false,
      force: false,
    });

    console.log(" [DB] All tables are ready");
  } catch (error) {
    console.error("[DB] Connection failed:", {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

// ================= SERVER START =================

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log(" [SERVER] Starting application...");

    // ================= DB =================
    await connectDB();

    // ================= HTTP SERVER =================
    const httpServer = createServer(app);

    // ================= SOCKET.IO =================
    console.log("[SOCKET] Initializing Socket.IO...");

    const io = new Server(httpServer, {
      cors: {
        origin: "*", // change in production
        methods: ["GET", "POST"],
      },
    });

    // Attach socket logic
    initChatSocket(io);

    console.log(" [SOCKET] Socket.IO initialized");

    // ================= START SERVER =================
    httpServer.listen(PORT, async () => {
      console.log("🌐 [SERVER] Server is live");
      console.log(` [SERVER] URL: http://localhost:${PORT}`);
      console.log(
        ` [SERVER] Environment: ${process.env.NODE_ENV || "development"}`,
      );

      console.log("[SERVER] Startup completed successfully");
    });
  } catch (err) {
    console.error(" [SERVER] Startup failed:", {
      message: err.message,
      stack: err.stack,
    });
    process.exit(1);
  }
}

startServer();

// // In-memory store for pending signups (for demo; use Redis in production)
// const pendingSignups = {};

// // Bulk delete comments (optional - for admin purposes)
// server.delete("/delete-comments-bulk", verifyJWT, async (req, res) => {
//   const { comment_ids, blog_id } = req.body;
//   const userId = req.user.id;

//   // Validate input
//   if (!comment_ids || !Array.isArray(comment_ids) || comment_ids.length === 0) {
//     return res.status(400).json({
//       success: false,
//       error: "comment_ids must be a non-empty array",
//     });
//   }

//   if (!blog_id || typeof blog_id !== "string") {
//     return res.status(400).json({
//       success: false,
//       error: "blog_id is required and must be a string",
//     });
//   }

//   const transaction = await sequelize.transaction();

//   try {
//     // Check if user is the blog author (only blog author can bulk delete)
//     const blog = await Blog.findOne({
//       where: { blog_id: blog_id.trim() },
//       attributes: ["author"],
//       transaction,
//     });

//     if (!blog) {
//       await transaction.rollback();
//       return res.status(404).json({
//         success: false,
//         error: "Blog not found",
//       });
//     }

//     // Check authorization - only blog author can bulk delete comments
//     if (blog.author !== userId) {
//       await transaction.rollback();
//       return res.status(403).json({
//         success: false,
//         error: "Only blog authors can bulk delete comments",
//       });
//     }

//     // Get all comments to be deleted
//     const commentsToDelete = await Comment.findAll({
//       where: {
//         comment_id: {
//           [Op.in]: comment_ids,
//         },
//         blog_id: blog_id.trim(),
//       },
//       attributes: ["comment_id", "children", "isReply"],
//       transaction,
//     });

//     if (commentsToDelete.length === 0) {
//       await transaction.rollback();
//       return res.status(404).json({
//         success: false,
//         error: "No comments found to delete",
//       });
//     }

//     // Collect all comment IDs including replies
//     const allCommentIds = [];
//     commentsToDelete.forEach((comment) => {
//       allCommentIds.push(comment.comment_id);
//       if (comment.children && comment.children.length > 0) {
//         allCommentIds.push(...comment.children);
//       }
//     });

//     // Delete all comments and replies
//     await Comment.destroy({
//       where: {
//         comment_id: {
//           [Op.in]: allCommentIds,
//         },
//       },
//       transaction,
//     });

//     // Delete related notifications
//     await Notification.destroy({
//       where: {
//         [Op.or]: [
//           { comment_id: { [Op.in]: allCommentIds } },
//           { reply: { [Op.in]: allCommentIds } },
//           { replied_on_comment: { [Op.in]: allCommentIds } },
//         ],
//       },
//       transaction,
//     });

//     // Get updated total comments count
//     const total_comments = await Comment.count({
//       where: { blog_id: blog_id.trim() },
//       transaction,
//     });

//     await transaction.commit();

//     console.log("Bulk comment deletion successful:", {
//       deleted_count: allCommentIds.length,
//       blog_id: blog_id.trim(),
//       total_comments,
//     });

//     return res.json({
//       success: true,
//       message: `Successfully deleted ${allCommentIds.length} comments`,
//       deleted_count: allCommentIds.length,
//       blog_id: blog_id.trim(),
//       total_comments,
//     });
//   } catch (err) {
//     await transaction.rollback();

//     console.error("Bulk comment deletion failed:", {
//       errorName: err.name,
//       errorMessage: err.message,
//     });

//     return res.status(500).json({
//       success: false,
//       message: "Error deleting comments",
//       error:
//         process.env.NODE_ENV === "development"
//           ? err.message
//           : "Database operation failed",
//     });
//   }
// });
