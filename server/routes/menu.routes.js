import express from "express";

import { getMenuController } from "../controllers/menu.controller.js";

const router = express.Router();

router.get("/", getMenuController);

export default router;
