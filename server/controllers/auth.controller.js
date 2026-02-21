import axios from "axios";
import bcrypt from "bcrypt";
import crypto from "crypto";

import { User, UserIPHistory } from "../models/associations.js";
import { generateAuthResponse } from "../services/auth-token.service.js";
import { getClientIp } from "../utils/network.js";
import { generateCustomerIdFromLocation } from "../utils/customerIdFromLocation.js";
import { Op } from "sequelize";
import {
  generateOTP,
  sendEmailOTP,
  sendSMSOTP,
} from "../services/otp.service.js";
import { generateUsername } from "../services/username.service.js";
import {
  emailRegex,
  passwordRegex,
  mobileRegex,
} from "../utils/validation.regex.js";
import { getAuth } from "firebase-admin/auth";

// In-memory store for pending signups (for demo; use Redis in production)
const pendingSignups = {};
export const signin = async (req, res) => {
  let { email, password, latitude, longitude } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "❌ Email and password are required" });
  }

  try {
    let user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(403).json({ error: "❌ Email not found" });
    }

    if (!user.google_auth) {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(403).json({ error: "❌ Incorrect password" });
      }

      // --- Customer ID generation & location update ---
      if (!user.customer_id) {
        if (latitude == null || longitude == null) {
          return res.status(400).json({
            error: "Location required to generate customer_id for this user",
          });
        }

        try {
          let nominatimUrl = process.env.NOMINATIM_URL;
          if (nominatimUrl) {
            nominatimUrl = nominatimUrl
              .replace(/\{lat\}/g, latitude)
              .replace(/\{lon\}/g, longitude);
          }

          const geoRes = await axios.get(nominatimUrl, {
            headers: { "User-Agent": "mern-blog-app/1.0" },
          });

          const address = geoRes.data.address || {};
          const country = address.country || "India";
          const state = address.state || address.state_district || "";
          const district =
            address.county ||
            address.city_district ||
            address.state_district ||
            "";
          const blockOrSub =
            address.city_district ||
            address.county ||
            address.residential ||
            address.city ||
            address.suburb ||
            "";
          const village =
            address.village ||
            address.city ||
            address.city_district ||
            address.county ||
            address.residential ||
            address.town ||
            address.suburb ||
            "";

          if (country && state && district && blockOrSub && village) {
            const { customer_id, abbr, codes } = generateCustomerIdFromLocation(
              {
                country,
                state,
                district,
                blockOrSub,
                village,
              },
            );

            if (customer_id) {
              await user.update({
                customer_id,
                abbr,
                country_code: codes.country,
                state_code: codes.state,
                district_code: codes.district,
                block_code: codes.block,
                village_code: codes.village,
                current_latitude: latitude,
                current_longitude: longitude,
                location_updated_at: new Date(),
              });

              user = await User.findOne({ where: { email } });
            }
          }
        } catch (err) {
          console.error("Error generating customer_id on signin:", err);
        }
      } else {
        // Update location if moved
        if (
          latitude != null &&
          longitude != null &&
          (user.current_latitude !== latitude ||
            user.current_longitude !== longitude)
        ) {
          await user.update({
            current_latitude: latitude,
            current_longitude: longitude,
            location_updated_at: new Date(),
          });
          user = await User.findOne({ where: { email } });
        }
      }
      // --- End Customer ID & location logic ---

      const ip_address = getClientIp(req);
      if (user && ip_address) {
        await UserIPHistory.create({
          user_id: user.user_id,
          ip_address,
          created_at: new Date(),
        });
      }

      return res.json(generateAuthResponse(user));
    } else {
      return res.status(403).json({
        error:
          "❌ Account was created using Google. Try logging in with Google",
      });
    }
  } catch (err) {
    console.error("Signin error:", err);
    return res.status(500).json({ error: "❌ Server error during signin" });
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
  } = req.body;

  // --- Validation ---
  if (!first_name || first_name.length < 1) {
    return res.status(403).json({ error: "❌ First name is required" });
  }
  if (!last_name || last_name.length < 1) {
    return res.status(403).json({ error: "❌ Last name is required" });
  }
  if (!email || !emailRegex.test(email)) {
    return res.status(403).json({ error: "❌ Email is invalid" });
  }
  if (!password || !passwordRegex.test(password)) {
    return res.status(403).json({
      error:
        "❌ Password must be at least 12 characters with uppercase, lowercase, number and special character",
    });
  }
  if (mobile_number && !mobileRegex.test(mobile_number)) {
    return res.status(403).json({ error: "❌ Mobile number is invalid" });
  }
  if (latitude == null || longitude == null) {
    return res.status(400).json({
      error: "❌ Location (latitude and longitude) is required for signup",
    });
  }

  try {
    // --- Reverse geocoding ---
    let nominatimUrl = process.env.NOMINATIM_URL;
    if (nominatimUrl) {
      nominatimUrl = nominatimUrl
        .replace(/\{lat\}/g, latitude)
        .replace(/\{lon\}/g, longitude);
    }
    const geoRes = await axios.get(nominatimUrl, {
      headers: { "User-Agent": "mern-blog-app/1.0" },
    });

    const address = geoRes.data.address || {};
    const country = address.country || "India";
    const state = address.state || address.state_district || "";
    const district =
      address.county || address.city_district || address.state_district || "";
    const blockOrSub =
      address.city_district ||
      address.county ||
      address.residential ||
      address.city ||
      address.suburb ||
      "";
    const village =
      address.village ||
      address.city ||
      address.city_district ||
      address.county ||
      address.residential ||
      address.town ||
      address.suburb ||
      "";

    if (!country || !state || !district || !blockOrSub || !village) {
      return res.status(400).json({
        error:
          "❌ Could not determine full location from coordinates. Please try again from a more specific location.",
      });
    }

    // --- Generate customer ID ---
    const { customer_id, abbr, codes } = generateCustomerIdFromLocation({
      country,
      state,
      district,
      blockOrSub,
      village,
    });

    // --- Hash password and generate username ---
    const hashed_password = await bcrypt.hash(password, 10);
    let username = await generateUsername(email);

    // --- Check if user exists ---
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }, { mobile_number }] },
    });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ error: "❌ Email already exists" });
      }
      if (existingUser.mobile_number === mobile_number) {
        return res
          .status(400)
          .json({ error: "❌ Mobile number already exists" });
      }
    }

    // --- Generate OTP and store signup in memory ---
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    pendingSignups[email] = {
      first_name,
      last_name,
      email,
      password: hashed_password,
      username,
      mobile_number: mobile_number || null,
      google_auth: false,
      customer_id,
      country_code: codes.country,
      state_code: codes.state,
      district_code: codes.district,
      block_code: codes.block,
      village_code: codes.village,
      latitude,
      longitude,
      otp,
      otpExpires,
      abbr,
      otpVerified: false,
    };

    // --- Send OTP ---
    await sendEmailOTP(email, otp);
    if (mobile_number) await sendSMSOTP(mobile_number, otp);

    return res.status(200).json({ message: "OTP sent to your email/mobile" });
  } catch (error) {
    console.error("Signup error:", error);
    if (error.message && error.message.includes("No matching village")) {
      return res.status(400).json({
        error: "❌ Invalid location data: village not found in LGD data",
      });
    }
    return res.status(500).json({ error: "❌ Server error during signup" });
  }
};

/**
 * Change user password
 * @route POST /api/auth/change-password
 * @access Private
 */
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Input validation
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      error: "❌ Both current password and new password are required",
    });
  }

  if (!passwordRegex.test(newPassword)) {
    return res.status(403).json({
      error:
        "❌ New password must be at least 12 characters long and include at least one numeric digit, one lowercase letter, one uppercase letter, and one special character.",
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      error: "❌ New password must be different from current password",
    });
  }

  try {
    const user = await User.findOne({ where: { user_id: req.user } });
    if (!user) return res.status(404).json({ error: "❌ User not found" });

    if (user.google_auth) {
      return res.status(403).json({
        error:
          "❌ Cannot change password for Google authenticated account. Use Google to manage your password.",
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      return res
        .status(403)
        .json({ error: "❌ Current password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await User.update(
      { password: hashedNewPassword },
      { where: { user_id: req.user } },
    );

    return res
      .status(200)
      .json({ message: "✅ Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return res
      .status(500)
      .json({ error: "❌ Server error occurred while changing password" });
  }
};
// IMPROVED GOOGLE AUTH ENDPOINT
export const googleAuth = async (req, res) => {
  const { access_token } = req.body;
  console.log("=== Google Auth Request ===");
  console.log("Received request body:", req.body);

  if (!access_token) {
    return res.status(400).json({ error: "❌ Access token is missing" });
  }

  try {
    // 1️⃣ Verify Firebase ID token
    console.log("🔍 Verifying Firebase ID token...");
    const decodedUser = await getAuth().verifyIdToken(access_token);

    if (!decodedUser) {
      console.log("❌ Token verification failed");
      return res.status(401).json({ error: "❌ Failed to verify token" });
    }

    let { email, name, picture, uid } = decodedUser;
    console.log("✅ Token verified successfully", { email, uid });

    // 2️⃣ Validate required fields
    if (!email || !name) {
      return res.status(400).json({
        error: "❌ Missing required user information from Google",
      });
    }

    // Improve profile picture quality
    if (picture) picture = picture.replace("s96-c", "s384-c");

    // 3️⃣ Check if user exists
    let user = await User.findOne({ where: { email } });

    if (user) {
      console.log("👤 User found in database:", user.user_id);

      // 3a️⃣ User exists but not via Google
      if (!user.google_auth) {
        return res.status(403).json({
          error:
            "❌ This email was signed up without Google. Please log in with a password.",
        });
      }

      // 3b️⃣ Update profile image if changed
      if (picture && user.profile_img !== picture) {
        console.log("📸 Updating profile image...");
        await user.update({ profile_img: picture });
        user = await User.findOne({ where: { email } });
      }

      console.log("✅ Existing Google user logged in successfully");
    } else {
      // 4️⃣ Create new Google user
      console.log("🆕 Creating new user...");

      const username = await generateUsername(email);

      user = await User.create({
        fullname: name,
        first_name: name.split(" ")[0] || "",
        last_name: name.split(" ").slice(1).join(" ") || "",
        email,
        profile_img: picture || "",
        username,
        google_auth: true,
        password: null, // Safe because allowNull: true in model
      });

      console.log("✅ New Google user created successfully:", user.user_id);
    }

    // 5️⃣ Generate response
    const responseData = generateAuthResponse(user);
    console.log("📤 Sending response for user:", user.user_id);

    return res.status(200).json(responseData);
  } catch (err) {
    console.error("❌ Google Auth Error Details:", err);

    // Firebase auth errors
    if (err.code === "auth/id-token-expired") {
      return res
        .status(401)
        .json({ error: "❌ Token has expired. Sign in again." });
    } else if (err.code === "auth/invalid-id-token") {
      return res
        .status(401)
        .json({ error: "❌ Invalid token. Sign in again." });
    } else if (err.code === "auth/project-not-found") {
      return res
        .status(500)
        .json({ error: "❌ Firebase project misconfiguration." });
    }

    // Sequelize / DB errors
    if (err.name && err.name.includes("Sequelize")) {
      return res.status(500).json({
        error: "❌ Database error during Google authentication.",
      });
    }

    return res.status(500).json({
      error: "❌ Failed to authenticate with Google. Please try again.",
    });
  }
};

export const completeSignup = async (req, res) => {
  const { email } = req.body;
  const pending = pendingSignups[email];
  if (!pending)
    return res.status(404).json({ error: "Signup not found or expired" });
  if (!pending.otpVerified)
    return res.status(400).json({ error: "OTP not verified" });
  try {
    // Double-check email/mobile uniqueness
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
        return res.status(400).json({ error: "❌ Email already exists" });
      }
      if (existingUser.mobile_number === pending.mobile_number) {
        return res
          .status(400)
          .json({ error: "❌ Mobile number already exists" });
      }
    }
    let user = await User.create({
      first_name: pending.first_name,
      last_name: pending.last_name,
      email: pending.email,
      password: pending.password,
      username: pending.username,
      mobile_number: pending.mobile_number,
      google_auth: false,
      customer_id: pending.customer_id,
      country_code: pending.country_code,
      state_code: pending.state_code,
      district_code: pending.district_code,
      block_code: pending.block_code,
      village_code: pending.village_code,
      latitude: pending.latitude,
      longitude: pending.longitude,
    });
    // Log IP address for signup
    const ip_address = getClientIp(req);
    if (user && ip_address) {
      await UserIPHistory.create({
        user_id: user.user_id,
        ip_address,
        created_at: new Date(),
      });
    }
    delete pendingSignups[email]; // Clean up
    return res.status(200).json({
      ...generateAuthResponse(user),
      customer_id: pending.customer_id,
      abbr: pending.abbr,
    });
  } catch (error) {
    console.error("Complete signup error:", error);
    return res
      .status(500)
      .json({ error: "❌ Server error during account creation" });
  }
};

export const verifyEmailOtp = async (req, res) => {
  const { email, otp } = req.body;
  const pending = pendingSignups[email];
  if (!pending)
    return res.status(404).json({ error: "Signup not found or expired" });
  if (pending.otp === otp && pending.otpExpires > new Date()) {
    pending.otpVerified = true;
    return res.json({ success: true });
  } else {
    return res.status(400).json({ error: "Invalid or expired OTP" });
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
    console.error("RESET PASSWORD ERROR 👉", err);
    res.status(500).json({ error: "Password reset failed" });
  }
};
