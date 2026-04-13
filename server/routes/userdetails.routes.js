import express from "express";
import {
  upsertUserDetails,
  getUserDetails,
  deleteUserDetails,
} from "../controllers/userDetails.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* ---------------- USER PROFILE ROUTES ---------------- */

router.post("/", verifyJWT, upsertUserDetails);
router.get("/", verifyJWT, getUserDetails);
router.delete("/", verifyJWT, deleteUserDetails);

export default router;
