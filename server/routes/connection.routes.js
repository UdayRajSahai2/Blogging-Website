import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
  sendRequest,
  acceptRequest,
  rejectRequest,
  getFriends,
  getPending,
  searchFriends,
  remove,
  getSent,
} from "../controllers/connection.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.post("/send", sendRequest);
router.post("/accept", acceptRequest);
router.post("/reject", rejectRequest);

router.get("/friends", getFriends);
router.get("/pending", getPending);

router.get("/search", searchFriends);
router.delete("/remove/:connectionId", remove);
router.get("/sent", getSent);
export default router;
