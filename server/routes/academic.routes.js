// server/routes/academic.routes.js
import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addAcademic,
  updateAcademic,
  deleteAcademic,
  getMyAcademics,
  getAcademicById,
  getAcademicsByUserId,
} from "../controllers/academic.controller.js";

const router = express.Router();

/* =========================
   PUBLIC ROUTES
========================= */
router.get("/user/:user_id", getAcademicsByUserId);

/* =========================
   PRIVATE ROUTES
========================= */
router.use(verifyJWT);

router.route("/").post(addAcademic).get(getMyAcademics);

router
  .route("/:academic_id")
  .get(getAcademicById)
  .put(updateAcademic)
  .delete(deleteAcademic);

export default router;
