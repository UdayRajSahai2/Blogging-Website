import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getNotifications,
  deleteNotification,
  getAllNotificationsCount,
  checkNewNotifications,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.post("/notifications", verifyJWT, getNotifications);
router.delete("/delete-notification", verifyJWT, deleteNotification);
router.post("/all-notifications-count", verifyJWT, getAllNotificationsCount);
router.get("/new-notification", verifyJWT, checkNewNotifications);

export default router;
