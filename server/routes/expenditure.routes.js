import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeSystemRoles } from "../middlewares/role.middleware.js";
import {
  addExpenditure,
  getExpenditureHistory,
} from "../controllers/expenditure.controller.js";

const router = express.Router();

router.post(
  "/add-expenditure",
  verifyJWT,
  authorizeSystemRoles("admin"),
  addExpenditure,
);

router.get(
  "/expenditure-history",
  verifyJWT,
  authorizeSystemRoles("admin"),
  getExpenditureHistory,
);

export default router;
