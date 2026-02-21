import express from "express";
import {
  getDomains,
  getFieldsByDomain,
  getSpecialtiesByField,
  getProfessionByProfileId,
  importProfessions,
  getProfessionStatistics,
  searchProfessions,
} from "../controllers/profession.controller.js";

const router = express.Router();

router.get("/domains", getDomains);
router.get("/fields/:domain_id", getFieldsByDomain);
router.get("/specialties/:field_id", getSpecialtiesByField);
router.get("/profile/:profile_id", getProfessionByProfileId);
router.post("/import", importProfessions);
router.get("/stats", getProfessionStatistics);
router.get("/search", searchProfessions);

export default router;
