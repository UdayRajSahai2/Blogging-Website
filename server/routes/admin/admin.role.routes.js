// backend/src/routes/admin/admin.role.routes.js

import express from "express";
import {
  assignRoleToUserByAdmin,
  getPendingRoleRequests,
  approveRole,
  rejectRole,
  createRole,
  getAllRoles,
  updateRole,
  deleteRole,
  getPendingRoleCount,
  getUsersByRole,
  getApprovedUsers,
  removeUserRole,
  updateUserRole,
  getUserDetails,
} from "../../controllers/admin/admin.role.controller.js";

import { authorizeRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

//  Only admin or super_admin (extra safety)
router.use(authorizeRoles("admin"));

//  Get all pending role requests
router.get("/role-requests", getPendingRoleRequests);
router.get("/role-requests/count", getPendingRoleCount);
router.get("/users-by-role/:role", getUsersByRole);
router.get("/approved-users", getApprovedUsers);
router.put("/update-user-role", updateUserRole);
router.get("/view-user/:user_id", getUserDetails);
//  Approve role
router.patch("/role-approve", approveRole);

//  Reject role
router.patch("/role-reject", rejectRole);
router.delete("/remove-user-role", removeUserRole);

//  Manual assign (optional)
router.post("/assign", assignRoleToUserByAdmin);
router.post("/create-role", createRole);
router.get("/all-roles", getAllRoles);
router.put("/update-role/:role_id", updateRole);
router.delete("/delete-role/:role_id", deleteRole);
export default router;
