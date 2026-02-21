import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addExpenditure,
  getExpenditureHistory,
} from "../controllers/expenditure.controller.js";

const router = express.Router();

router.post("/add-expenditure", verifyJWT, addExpenditure);
router.get("/expenditure-history", getExpenditureHistory);
export default router;
