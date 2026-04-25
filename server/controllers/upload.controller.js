// server/controllers/upload.controller.js
import { generateUploadURL } from "../config/aws.config.js";

export const getUploadURL = async (req, res) => {
  try {
    const { fileType } = req.query;

    if (!fileType) {
      return res.status(400).json({ error: "File type is required" });
    }

    const { uploadURL, key } = await generateUploadURL(fileType);

    //  CloudFront URL
    const fileURL = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return res.status(200).json({
      uploadURL,
      fileURL,
    });
  } catch (err) {
    console.error("Get upload URL error:", err.message);

    return res.status(500).json({
      error: "Failed to generate upload URL",
    });
  }
};
