import express from "express";
import { getPageByPath } from "../controllers/page.controller.js";

const router = express.Router();

// GET /api/pages?path=/products
router.get("/", getPageByPath);

export default router;
