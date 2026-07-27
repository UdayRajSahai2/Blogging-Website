//server\routes\professional-profile.routes.js
import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
  getProfessionalProfile,
  addExperience,
  updateExperience,
  deleteExperience,
  getExperienceById,
} from "../controllers/professional-profile.controller.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PROFILE
|--------------------------------------------------------------------------
*/

router.get("/", verifyJWT, getProfessionalProfile); // own profile

/*
|--------------------------------------------------------------------------
| EXPERIENCE
|--------------------------------------------------------------------------
*/

router.get("/experience/:id", verifyJWT, getExperienceById);

router.post("/experience", verifyJWT, addExperience);
router.put("/experience/:id", verifyJWT, updateExperience);
router.delete("/experience/:id", verifyJWT, deleteExperience);

router.get("/:user_id", getProfessionalProfile);

export default router;
