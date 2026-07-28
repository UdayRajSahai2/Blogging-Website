//server\routes\admin\index.js
import express from "express";

import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { authorizeSystemRoles } from "../../middlewares/role.middleware.js";

import adminCoreRoutes from "./admin.routes.js";
import adminRoleRoutes from "./adminRole.routes.js";
import adminPageRoutes from "./admin.page.routes.js";

const router = express.Router();

/* GLOBAL ADMIN PROTECTION */
router.use(verifyJWT, authorizeSystemRoles("admin"));

/* CORE ROUTES */
router.use("/", adminCoreRoutes);

/* ROLE MANAGEMENT */
router.use("/roles", adminRoleRoutes);

/* PAGE CMS */
router.use("/pages", adminPageRoutes);

export default router;
