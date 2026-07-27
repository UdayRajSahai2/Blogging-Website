import express from "express";
import * as ctrl from "../controllers/userInterests.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeSystemRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// =========================
//  ADMIN
// =========================
router.post(
  "/",
  verifyJWT,
  authorizeSystemRoles("admin", "super_admin"),
  ctrl.createInterest,
);

router.delete(
  "/:interest_id",
  verifyJWT,
  authorizeSystemRoles("admin", "super_admin"),
  ctrl.deleteInterest,
);

// =========================
//  INTERESTS
// =========================
router.get("/tree", verifyJWT, ctrl.getInterestTree);
router.get("/", verifyJWT, ctrl.getAllInterests);

// =========================
//  USER INTERESTS
// =========================
router.get("/user", verifyJWT, ctrl.getUserInterests);
router.post("/user", verifyJWT, ctrl.addUserInterests);
router.put("/user", verifyJWT, ctrl.replaceUserInterests);
router.delete("/user/:interest_id", verifyJWT, ctrl.removeUserInterest);

export default router;
