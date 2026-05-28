import express from "express";

import { deleteImage, getUploadURL } from "../controllers/upload.controller.js";

const router = express.Router();

/* GET SIGNED UPLOAD URL */
router.get("/get-upload-url", getUploadURL);

/* DELETE IMAGE */
router.delete("/delete", deleteImage);

export default router;
