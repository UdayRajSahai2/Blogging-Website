import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  registerDonor,
  donorProfile,
} from "../controllers/donor.controller.js";

const router = express.Router();
router.post("/register-donor", verifyJWT, registerDonor);
router.get("/donor-profile", verifyJWT, donorProfile);

export default router;
