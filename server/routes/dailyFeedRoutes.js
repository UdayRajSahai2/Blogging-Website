//server\routes\dailyFeedRoutes.js
import express from "express";

import { currentWeather, getNews } from "../controllers/dailyFeedController.js";

const router = express.Router();

router.get("/weather/current", currentWeather);

router.get("/news", getNews);

export default router;
