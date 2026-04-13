// backend/src/routes/role.routes.js

import express from "express";
import { getMyRoles, requestRoles } from "../controllers/role.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 👤 USER ROLE APIs
router.post("/add", verifyJWT, requestRoles);
router.get("/me", verifyJWT, getMyRoles);

export default router;
