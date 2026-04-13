import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
  addBalanceSnapshot,
  getBalanceHistory,
  getFinancialSummary,
} from "../controllers/finance.controller.js";

const router = express.Router();

router.post(
  "/add-balance-snapshot",
  verifyJWT,
  authorizeRoles("admin"),
  addBalanceSnapshot,
);

router.get(
  "/balance-history",
  verifyJWT,
  authorizeRoles("admin"),
  getBalanceHistory,
);

router.get(
  "/financial-summary",
  verifyJWT,
  authorizeRoles("admin"),
  getFinancialSummary,
);

export default router;
