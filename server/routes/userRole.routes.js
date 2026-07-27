import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  requestRole,
  getMyRoles,
  setPrimaryRole,
  getAvailableRoles,
  withdrawRoleRequest,
} from "../controllers/userRole.controller.js";

const router = express.Router();

// User requests a business role
router.post("/request", verifyJWT, requestRole);

// Get logged-in user's roles
router.get("/my-roles", verifyJWT, getMyRoles);

// Set default dashboard role
router.patch("/primary-role", verifyJWT, setPrimaryRole);

//List Available Active Roles
router.get("/available", verifyJWT, getAvailableRoles);

router.delete("/request/:userRoleId", verifyJWT, withdrawRoleRequest);
export default router;
