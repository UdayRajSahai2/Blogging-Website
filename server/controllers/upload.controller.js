// server/controllers/upload.controller.js
import { generateUploadURL } from "../config/aws.config.js";

export const getUploadURL = async (req, res) => {
  try {
    const { fileType } = req.query;
    if (!fileType) {
      return res.status(400).json({ error: "File type is required" });
    }

    const url = await generateUploadURL(fileType);
    return res.status(200).json({ uploadURL: url });
  } catch (err) {
    console.error("Get upload URL error:", err.message);
    return res.status(500).json({
      error: "Failed to generate upload URL",
      details: err.message,
    });
  }
};
