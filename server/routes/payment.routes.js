import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPaymentOrder,
  getPaymentDetails,
  verifyPayment,
} from "../controllers/payment.controller.js";
const router = express.Router();

router.post("/create-order", verifyJWT, createPaymentOrder);
router.post("/payment/verify", verifyJWT, verifyPayment);
router.get("/payment-details", verifyJWT, getPaymentDetails);
export default router;
