import express from "express";

import {
  createEnrollmentController,
  getEnrollmentByUserController,
} from "../controllers/studentEnrollment.controller.js";

const router = express.Router();

router.post("/create", createEnrollmentController);

router.get("/user/:user_id", getEnrollmentByUserController);

export default router;
