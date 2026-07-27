//server\routes\profile.routes.js
import express from "express";

import { getSimilarProfiles } from "../controllers/profile.controller.js";

const router = express.Router();

//  GET TOP 10 SIMILAR PROFILES

router.get("/similar-profiles", getSimilarProfiles);

export default router;
