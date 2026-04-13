// server/routes/admin/index.js

import express from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";

import adminCoreRoutes from "./admin.routes.js";
import adminRoleRoutes from "./admin.role.routes.js";

const router = express.Router();

// 🔐 Global protection
router.use(verifyJWT, authorizeRoles("admin"));

// 📦 Core routes
router.use("/", adminCoreRoutes);

// 🎭 Role management routes
router.use("/roles", adminRoleRoutes);

export default router;
