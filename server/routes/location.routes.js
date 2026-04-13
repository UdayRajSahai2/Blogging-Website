import express from "express";
import {
  getCountries,
  getStates,
  getDistricts,
} from "../controllers/location.controller.js";

const router = express.Router();

router.get("/countries", getCountries);
router.get("/states", getStates);
router.get("/districts", getDistricts);

export default router;
