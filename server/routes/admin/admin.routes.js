//server\routes\admin\admin.routes.js
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
  getEnrollments,
  getUsersByStatus,
  updateUserApprovalStatus,
  approveUser,
  rejectUser,
  getReferrers,
} from "../../controllers/admin/admin.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { authorizeSystemRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

// (auth)
router.use(verifyJWT, authorizeSystemRoles("admin"));

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

// Enrollments

router.get("/enrollments", getEnrollments);

router.get("/referrers", getReferrers);

router.get("/users/approval", getUsersByStatus);
router.put("/users/:userId/approval", updateUserApprovalStatus);
router.patch("/users/:userId/approve", approveUser);

router.patch("/users/:userId/reject", rejectUser);

export default router;
