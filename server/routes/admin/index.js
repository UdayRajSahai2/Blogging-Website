// server/routes/admin/index.js

import express from "express";

import { verifyJWT } from "../../middlewares/auth.middleware.js";

import { authorizeRoles } from "../../middlewares/role.middleware.js";

import adminCoreRoutes from "./admin.routes.js";

import adminRoleRoutes from "./admin.role.routes.js";

import adminPageRoutes from "./admin.page.routes.js";

const router = express.Router();

/* GLOBAL ADMIN PROTECTION */
router.use(verifyJWT, authorizeRoles("admin"));

/* CORE ROUTES */
router.use("/", adminCoreRoutes);

/* ROLE ROUTES */
router.use("/roles", adminRoleRoutes);

/* PAGE CMS ROUTES */
router.use("/pages", adminPageRoutes);

export default router;
