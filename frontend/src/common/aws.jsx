// frontend/src/common/aws.jsx
import axios from "axios";
import { UPLOAD_API } from "./api";

// Upload image to S3 via signed URL
export const uploadImage = async (file) => {
  if (!file) throw new Error("No file provided");

  try {
    // 1. Request a presigned URL from backend
    const response = await axios.get(`${UPLOAD_API}/get-upload-url`, {
      params: { fileType: file.type },
    });

    const uploadURL = response.data?.uploadURL;
    if (!uploadURL) {
      throw new Error("No upload URL returned from server");
    }

    // 2. Upload file directly to S3
    await axios.put(uploadURL, file, {
      headers: { "Content-Type": file.type },
    });

    // 3. Return the public file URL (strip query params)
    return uploadURL.split("?")[0];
  } catch (err) {
    const message = err.response?.data?.error || err.message || "Upload failed";
    console.error("Image upload failed:", message);
    throw new Error(message);
  }
};
