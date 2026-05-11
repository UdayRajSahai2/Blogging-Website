import express from "express";
import {
  getAdminStats,
  getAllUsers,
  deleteUser,
  updateUserRole,
  restoreUser,
  getAllBlogs,
  updateBlogStatus,
  restoreBlogAdmin,
  deleteBlogAdmin,
  deleteBlogPermanent,
  deleteUserPermanent,
} from "../../controllers/admin/admin.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

// (auth)
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
router.delete("/users/:id/permanent", deleteUserPermanent);
// ========================
// Blogs
// ========================
router.get("/blogs", getAllBlogs);
router.patch("/blogs/:id/status", updateBlogStatus);

//  SOFT DELETE
router.delete("/blogs/:id", deleteBlogAdmin);

// RESTORE
router.patch("/blogs/:id/restore", restoreBlogAdmin);

//  HARD DELETE
router.delete("/blogs/:id/permanent", deleteBlogPermanent);

export default router;
