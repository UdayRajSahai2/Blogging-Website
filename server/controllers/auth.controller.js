//server\controllers\auth.controller.js
import axios from "axios";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Op } from "sequelize";
import User from "../models/user/User.js";
import UserIPHistory from "../models/user/UserIPHistory.js";
import { generateAuthResponse } from "../services/auth-token.service.js";
import { getClientIp } from "../utils/network.js";
import { assignCustomerLocation } from "../services/locationService.js";
import { generateUsername } from "../services/username.service.js";
import {
  generateOTP,
  sendEmailOTP,
  sendSMSOTP,
} from "../services/otp.service.js";
import {
  emailRegex,
  passwordRegex,
  mobileRegex,
} from "../utils/validation.regex.js";
import { getAuth } from "firebase-admin/auth";
import {
  sendPendingApprovalEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  sendAdminSignupNotification,
} from "../services/email.service.js";
import { createEnrollment } from "../services/userService.js";

// In-memory store for pending signups (for demo; use Redis in production)
const pendingSignups = {};

export const signin = async (req, res) => {
  const { email, password, latitude, longitude } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: " Email and password are required" });
  }

  try {
    let user = await User.findOne({
      where: { email },
    });

    // USER NOT FOUND
    if (!user) {
      return res.status(403).json({ error: " Email not found" });
    }

    // PASSWORD CHECK
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(403).json({ error: " Incorrect password" });
    }
    if (user.approval_status === "pending") {
      return res.status(403).json({
        code: "ACCOUNT_PENDING",
        error: "Your account is waiting for admin approval.",
      });
    }

    if (user.approval_status === "rejected") {
      return res.status(403).json({
        code: "ACCOUNT_REJECTED",
        error: "Your account has been rejected. Please contact support.",
      });
    }
    // CUSTOMER ID + LOCATION LOGIC (via service)
    try {
      user = await assignCustomerLocation(user, latitude, longitude);
    } catch (err) {
      console.error("Location assignment failed:", err);
      // do NOT block login
    }

    // IP TRACKING
    try {
      const ip_address = getClientIp(req);

      if (ip_address) {
        await UserIPHistory.create({
          user_id: user.user_id,
          ip_address,
          created_at: new Date(),
        });
      }
    } catch (err) {
      console.error("IP tracking failed:", err);
    }

    // FINAL RESPONSE
    return res.json(generateAuthResponse(user));
  } catch (err) {
    console.error("Signin error:", err);

    return res.status(500).json({
      error: " Server error during signin",
    });
  }
};

export const signup = async (req, res) => {
  let {
    first_name,
    last_name,
    email,
    password,
    mobile_number,
    latitude,
    longitude,
    referrer_name,
    referrer_email,
    referrer_mobile,
    referrer_district,
    isStudent,
  } = req.body;

  // VALIDATION
  if (!first_name || first_name.length < 1) {
    return res.status(403).json({ error: " First name is required" });
  }

  if (!last_name || last_name.length < 1) {
    return res.status(403).json({ error: " Last name is required" });
  }

  if (!email || !emailRegex.test(email)) {
    return res.status(403).json({ error: "Email is invalid" });
  }

  if (!password || !passwordRegex.test(password)) {
    return res.status(403).json({
      error:
        " Password must be at least 12 characters with uppercase, lowercase, number and special character",
    });
  }

  if (mobile_number && !mobileRegex.test(mobile_number)) {
    return res.status(403).json({ error: " Mobile number is invalid" });
  }

  console.log({
    email,
    mobile_number,
  });
  try {
    // CHECK IF USER ALREADY EXISTS
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }, { mobile_number }] },
    });

    if (existingUser) {
      console.log("Existing user found:", {
        dbEmail: existingUser.email,
        dbMobile: existingUser.mobile_number,
        reqEmail: email,
        reqMobile: mobile_number,
      });

      if (existingUser.email === email) {
        return res.status(400).json({
          error: "Email already exists",
        });
      }

      if (existingUser.mobile_number === mobile_number) {
        return res.status(400).json({
          error: "Mobile number already exists",
        });
      }
    }

    // HASH PASSWORD
    const hashed_password = await bcrypt.hash(password, 10);

    // GENERATE USERNAME
    const username = await generateUsername(email);

    // GENERATE OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    // STORE PENDING SIGNUP
    pendingSignups[email] = {
      first_name,
      last_name,
      email,
      password: hashed_password,
      username,
      mobile_number: mobile_number || null,
      google_auth: false,
      latitude,
      longitude,

      referrer_name,
      referrer_email,
      referrer_mobile,
      referrer_district,

      otp,
      otpExpires,
      otpVerified: false,

      isStudent,
    };

    // SEND OTP

    await sendEmailOTP(email, otp);

    if (mobile_number) {
      await sendSMSOTP(mobile_number, otp);
    }

    console.log(" OTP sent:", otp);

    return res.status(200).json({
      message: "OTP sent to your email/mobile",
    });
  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      error: "Unable to send OTP. Please try again.",
    });
  }
};

export const googleAuth = async (req, res) => {
  const { access_token, latitude, longitude } = req.body;

  if (!access_token) {
    return res.status(400).json({
      error: "Access token missing",
    });
  }

  try {
    // Verify Firebase token
    const decodedUser = await getAuth().verifyIdToken(access_token);

    if (!decodedUser) {
      return res.status(401).json({
        error: "Failed to verify token",
      });
    }

    let { email, name, picture } = decodedUser;

    if (!email || !name) {
      return res.status(400).json({
        error: "Missing required user information from Google",
      });
    }

    // Better quality profile image
    if (picture) {
      picture = picture.replace("s96-c", "s384-c");
    }

    // Find existing user
    let user = await User.findOne({
      where: { email },
    });

    // User not found -> Google signup disabled
    if (!user) {
      return res.status(404).json({
        error: "No account found. Please use the registration page.",
      });
    }

    // Account exists but was created using email/password
    if (!user.google_auth) {
      await user.update({
        google_auth: true,
        profile_img: picture || user.profile_img,
      });

      user = await User.findByPk(user.user_id);
    }

    // Update profile image if changed
    if (picture && user.profile_img !== picture) {
      await user.update({
        profile_img: picture,
      });

      user = await User.findByPk(user.user_id);
    }

    // Update location (don't block login)
    try {
      user = await assignCustomerLocation(user, latitude, longitude);
    } catch (err) {
      console.error("Location assignment failed:", err);
    }

    // Approval checks
    if (user.approval_status === "pending") {
      return res.status(403).json({
        code: "ACCOUNT_PENDING",
        error: "Your account is waiting for admin approval.",
      });
    }

    if (user.approval_status === "rejected") {
      return res.status(403).json({
        code: "ACCOUNT_REJECTED",
        error: "Your account has been rejected.",
      });
    }

    // Successful login
    return res.status(200).json(generateAuthResponse(user));
  } catch (err) {
    console.error(err);

    if (err.code === "auth/id-token-expired") {
      return res.status(401).json({
        error: "Token expired",
      });
    }

    if (err.code === "auth/invalid-id-token") {
      return res.status(401).json({
        error: "Invalid token",
      });
    }

    return res.status(500).json({
      error: "Failed to authenticate with Google",
    });
  }
};

export const completeSignup = async (req, res) => {
  const { email } = req.body;

  const pending = pendingSignups[email];

  if (!pending) {
    return res.status(404).json({ error: "Signup not found or expired" });
  }

  if (!pending.otpVerified) {
    return res.status(400).json({ error: "OTP not verified" });
  }

  try {
    // DOUBLE-CHECK EMAIL / MOBILE UNIQUENESS
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email: pending.email },
          { mobile_number: pending.mobile_number },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === pending.email) {
        return res.status(400).json({ error: " Email already exists" });
      }

      if (existingUser.mobile_number === pending.mobile_number) {
        return res.status(400).json({ error: " Mobile number already exists" });
      }
    }

    // CREATE USER
    let user = await User.create({
      first_name: pending.first_name,
      last_name: pending.last_name,
      email: pending.email,
      password: pending.password,
      username: pending.username,
      mobile_number: pending.mobile_number,
      google_auth: false,
      approval_status: "pending",
    });
    const enrollment = await createEnrollment({
      user_id: user.user_id,

      enrollment_type:
        pending.isStudent === true || pending.isStudent === "true"
          ? "student"
          : "referrer",

      referrer_name: pending.referrer_name,

      referrer_email: pending.referrer_email,

      referrer_mobile: pending.referrer_mobile,

      referrer_district: pending.referrer_district,
    });
    try {
      await sendPendingApprovalEmail(
        user.email,
        user.first_name || user.fullname,
      );

      await sendAdminSignupNotification(user, enrollment);
    } catch (err) {
      console.error("Failed to send signup emails:", err);
    }
    // ASSIGN LOCATION + GENERATE CUSTOMER ID
    try {
      user = await assignCustomerLocation(
        user,
        pending.latitude,
        pending.longitude,
      );
    } catch (err) {
      console.error("Location assignment failed:", err);
      // do not block signup
    }

    // TRACK IP ADDRESS
    try {
      const ip_address = getClientIp(req);

      if (ip_address) {
        await UserIPHistory.create({
          user_id: user.user_id,
          ip_address,
          created_at: new Date(),
        });
      }
    } catch (err) {
      console.error("IP tracking failed:", err);
    }

    // CLEANUP PENDING SIGNUP
    delete pendingSignups[email];

    // FINAL RESPONSE
    return res.status(200).json({
      success: true,
      user: {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      approval_status: "pending",
      message: "Your account is awaiting admin approval.",
    });
  } catch (error) {
    console.error("Complete signup error:", error);

    return res.status(500).json({
      error: " Server error during account creation",
    });
  }
};

export const verifyEmailOtp = async (req, res) => {
  const { email, otp } = req.body;
  const pending = pendingSignups[email];

  if (!pending) {
    return res.status(404).json({
      error: "Signup not found or expired",
    });
  }

  if (pending.otpExpires < new Date()) {
    return res.status(400).json({
      error: "OTP expired",
    });
  }

  if (pending.otp !== otp) {
    return res.status(400).json({
      error: "Invalid OTP",
    });
  }

  pending.otpVerified = true;

  return res.json({
    success: true,
  });
};
/**
 * Change user password
 * @route POST /api/auth/change-password
 * @access Private
 */
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      error: " Both current password and new password are required",
    });
  }

  if (!passwordRegex.test(newPassword)) {
    return res.status(403).json({
      error:
        " New password must be at least 12 characters long and include at least one numeric digit, one lowercase letter, one uppercase letter, and one special character.",
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      error: " New password must be different from current password",
    });
  }

  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: " User not found" });
    }

    if (user.google_auth) {
      return res.status(403).json({
        error:
          " Cannot change password for Google authenticated account. Use Google to manage your password.",
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      return res.status(403).json({
        error: " Current password is incorrect",
      });
    }

    const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await User.update(
      { password: hashedNewPassword },
      { where: { user_id: req.user.id } },
    );

    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      error: " Server error occurred while changing password",
    });
  }
};
/** ---------------- Send OTP ---------------- */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.email_otp = hashedOtp;
    user.otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendEmailOTP(email, otp);
    } catch (err) {
      user.email_otp = null;
      user.otp_expires_at = null;
      await user.save();

      return res.status(500).json({
        error: "Unable to send OTP. Try again later.",
      });
    }

    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR ", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

/** ---------------- Verify OTP ---------------- */
export const verifyForgotPasswordOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.email_otp || user.otp_expires_at < new Date())
      return res.status(400).json({ error: "OTP expired" });

    const isValid = await bcrypt.compare(otp, user.email_otp);
    if (!isValid) return res.status(400).json({ error: "Invalid OTP" });

    // Generate secure reset token
    const resetToken = crypto.randomUUID();
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.reset_token = hashedToken;
    user.reset_token_expires_at = new Date(Date.now() + 10 * 60 * 1000);

    // Invalidate OTP immediately
    user.email_otp = null;
    user.otp_expires_at = null;

    await user.save();

    res.json({
      success: true,
      resetToken, // send RAW token to frontend
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OTP verification failed" });
  }
};

/** ---------------- Verify Reset Token ---------------- */
export const validatePasswordResetToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Token required" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      where: {
        reset_token: hashedToken,
        reset_token_expires_at: { [Op.gt]: new Date() },
      },
    });

    if (!user)
      return res.status(400).json({ error: "Invalid or expired token" });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to verify token" });
  }
};

/** ---------------- Reset Password ---------------- */
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res.status(400).json({ error: "Invalid request" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      where: {
        reset_token: hashedToken,
        reset_token_expires_at: { [Op.gt]: new Date() },
      },
    });

    if (!user)
      return res.status(400).json({ error: "Reset link expired or invalid" });

    user.password = await bcrypt.hash(password, 10);
    user.reset_token = null;
    user.reset_token_expires_at = null;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (err) {
    console.error("RESET PASSWORD ERROR ", err);
    res.status(500).json({ error: "Password reset failed" });
  }
};
/** ---------------- User Profile Onboarding ---------------- */
export const completeOnboarding = async (req, res) => {
  try {
    await User.update(
      { is_onboarding_completed: true },
      { where: { user_id: req.user.id } },
    );

    //  fetch updated user
    const user = await User.findByPk(req.user.id);

    return res.json({
      success: true,
      isOnboardingCompleted: user.is_onboarding_completed,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to complete onboarding" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Logout failed",
    });
  }
};
