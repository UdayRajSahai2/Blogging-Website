import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
  addExpenditure,
  getExpenditureHistory,
} from "../controllers/expenditure.controller.js";

const router = express.Router();

router.post(
  "/add-expenditure",
  verifyJWT,
  authorizeRoles("admin"),
  addExpenditure,
);

router.get(
  "/expenditure-history",
  verifyJWT,
  authorizeRoles("admin"),
  getExpenditureHistory,
);

export default router;
