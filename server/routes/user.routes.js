import express from "express";
import {
  updateProfileImage,
  getProfile,
  updateProfile,
  updateLocation,
  toggleLocationPrivacy,
  findNearbyUsers,
  searchUsers,
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

export default router;
