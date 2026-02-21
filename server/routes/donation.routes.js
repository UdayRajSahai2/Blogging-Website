import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  donationHistory,
  getDonationAnalytics,
  makeDonation,
  updateDonationBankAccount,
} from "../controllers/donation.controller.js";

const router = express.Router();

router.post("/make-donation", verifyJWT, makeDonation);
router.get("/donation-history", verifyJWT, donationHistory);
router.get("/donation-analytics", verifyJWT, getDonationAnalytics);
router.patch("/update-bank-account", verifyJWT, updateDonationBankAccount);

export default router;
