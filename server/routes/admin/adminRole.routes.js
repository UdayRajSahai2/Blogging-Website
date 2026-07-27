// server/routes/admin/adminRole.routes.js

import express from "express";
import { authorizeSystemRoles } from "../../middlewares/role.middleware.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import {
  getRoleRequests,
  approveRoleRequest,
  rejectRoleRequest,
  revokeRoleRequest,
} from "../../controllers/admin/adminRole.controller.js";

const router = express.Router();
router.use(verifyJWT);
router.use(authorizeSystemRoles("admin", "super_admin"));

//   ADMIN ROLE MANAGEMENT
//   Base URL: /api/admin/roles

// Get all user role records
router.get("/", getRoleRequests);

// Approve a pending request
router.patch("/:userRoleId/approve", approveRoleRequest);

// Reject a pending request
router.patch("/:userRoleId/reject", rejectRoleRequest);

// Revoke an approved role
router.patch("/:userRoleId/revoke", revokeRoleRequest);

export default router;
