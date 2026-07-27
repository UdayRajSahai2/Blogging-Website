import express from "express";
import {
  updateProfileImage,
  getProfile,
  updateProfile,
  updateLocation,
  toggleLocationPrivacy,
  findNearbyUsers,
  searchUsers,
  sendMobileUpdateOtp,
  verifyMobileUpdateOtp,
  createEnrollmentController,
  getEnrollmentByUserController,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/update-profile-img", verifyJWT, updateProfileImage);
router.post("/get-profile", getProfile);
router.post("/update-profile", verifyJWT, updateProfile);
router.post("/search-users", searchUsers);
router.post("/update-location", verifyJWT, updateLocation);
router.post("/toggle-location-privacy", verifyJWT, toggleLocationPrivacy);
router.post("/find-nearby-users", findNearbyUsers);

//  MOBILE UPDATE (OTP FLOW)
router.post("/mobile/send-otp", verifyJWT, sendMobileUpdateOtp);
router.post("/mobile/verify-otp", verifyJWT, verifyMobileUpdateOtp);

//Enrollments
router.post("/create", createEnrollmentController);
router.get("/user/:user_id", getEnrollmentByUserController);

export default router;
