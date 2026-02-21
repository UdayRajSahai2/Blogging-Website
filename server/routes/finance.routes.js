import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addBalanceSnapshot,
  getBalanceHistory,
  getFinancialSummary,
} from "../controllers/finance.controller.js";

const router = express.Router();
router.post("/add-balance-snapshot", verifyJWT, addBalanceSnapshot);
router.get("/balance-history", getBalanceHistory);
router.get("/financial-summary", getFinancialSummary);

export default router;
