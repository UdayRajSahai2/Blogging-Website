import express from "express";
import menuData from "../data/menuData.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json(menuData);
});

export default router;
