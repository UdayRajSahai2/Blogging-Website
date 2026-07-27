import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeSystemRoles } from "../middlewares/role.middleware.js";
import {
  addBalanceSnapshot,
  getBalanceHistory,
  getFinancialSummary,
} from "../controllers/finance.controller.js";

const router = express.Router();

router.post(
  "/add-balance-snapshot",
  verifyJWT,
  authorizeSystemRoles("admin"),
  addBalanceSnapshot,
);

router.get(
  "/balance-history",
  verifyJWT,
  authorizeSystemRoles("admin"),
  getBalanceHistory,
);

router.get(
  "/financial-summary",
  verifyJWT,
  authorizeSystemRoles("admin"),
  getFinancialSummary,
);

export default router;
