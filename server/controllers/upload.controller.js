import { DeleteObjectCommand } from "@aws-sdk/client-s3";

import { s3, generateUploadURL } from "../config/aws.config.js";

/* GET UPLOAD URL */
export const getUploadURL = async (req, res) => {
  try {
    const {
      fileType,

      // DEFAULT BLOG FOLDER
      folder = "blog-banner-upload",
    } = req.query;

    if (!fileType) {
      return res.status(400).json({
        error: "File type is required",
      });
    }

    const { uploadURL, key } = await generateUploadURL(fileType, folder);

    // FILE URL
    const fileURL = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return res.status(200).json({
      uploadURL,
      fileURL,
      key,
    });
  } catch (err) {
    console.error("Get upload URL error:", err.message);

    return res.status(500).json({
      error: "Failed to generate upload URL",
    });
  }
};

/* DELETE IMAGE */
export const deleteImage = async (req, res) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({
        error: "Image key is required",
      });
    }

    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,

        Key: key,
      }),
    );

    return res.status(200).json({
      message: "Image deleted successfully",
    });
  } catch (err) {
    console.error("Delete image error:", err.message);

    return res.status(500).json({
      error: "Failed to delete image",
    });
  }
};
