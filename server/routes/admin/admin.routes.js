import express from "express";
import {
  getAdminStats,
  getAllUsers,
  deleteUser,
  updateUserRole,
  restoreUser,
  deleteBlogAdmin,
  getAllBlogs,
  updateBlogStatus,
  restoreBlogAdmin,
} from "../../controllers/admin/admin.controller.js";

import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

// 🔐 Apply globally to all admin routes
router.use(verifyJWT, authorizeRoles("admin"));

// ========================
// Dashboard
// ========================
router.get("/stats", getAdminStats);

// ========================
// Users
// ========================
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/restore", restoreUser);

// ========================
// Blogs
// ========================
router.get("/blogs", getAllBlogs);
router.patch("/blogs/:id/status", updateBlogStatus);
router.delete("/blogs/:id", deleteBlogAdmin);
router.patch("/blogs/:id/restore", restoreBlogAdmin);

export default router;
