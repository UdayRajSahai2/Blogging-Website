import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  signin,
  signup,
  changePassword,
  googleAuth,
  completeSignup,
  verifyEmailOtp,
  resetPassword,
  forgotPassword,
  verifyForgotPasswordOTP,
  validatePasswordResetToken,
} from "../controllers/auth.controller.js";
import {
  sendOtpLimiter,
  verifyOtpLimiter,
  resetPasswordLimiter,
} from "../middlewares/rateLimiters.js";

const router = express.Router();
/* ---------------- Auth Routes ---------------- */

router.post("/signin", signin);
router.post("/signup", signup);
router.post("/google-auth", googleAuth);
router.post("/complete-signup", completeSignup);
router.post("/verify-email-otp", verifyEmailOtp);

/* ---------------- Password Flow ---------------- */

router.post("/forgot-password", sendOtpLimiter, forgotPassword);
router.post(
  "/verify-password-email-otp",
  verifyOtpLimiter,
  verifyForgotPasswordOTP,
);
router.post("/validate-password-reset-token", validatePasswordResetToken);

router.post("/reset-password", resetPasswordLimiter, resetPassword);

/* ---------------- Protected ---------------- */

router.post("/change-password", verifyJWT, changePassword);

export default router;
