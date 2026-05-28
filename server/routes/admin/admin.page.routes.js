import express from "express";

import {
  createPageController,
  getAllPagesController,
  getPageByIdController,
  updatePageController,
} from "../../controllers/admin/admin.page.controller.js";

const router = express.Router();

/* GET ALL PAGES */
router.get("/", getAllPagesController);

/* GET SINGLE PAGE */
router.get("/:id", getPageByIdController);

/* CREATE PAGE */
router.post("/", createPageController);

/* UPDATE PAGE */
router.put("/:id", updatePageController);

export default router;
