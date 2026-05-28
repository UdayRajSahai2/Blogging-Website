// frontend/src/common/aws.jsx

import axios from "axios";
import { UPLOAD_API } from "./api";

// Upload image to S3 via signed URL
export const uploadImage = async (
  file,

  // DEFAULT BLOG FOLDER
  folder = "blog-banner-upload",
) => {
  if (!file) {
    throw new Error("No file provided");
  }

  try {
    const response = await axios.get(`${UPLOAD_API}/get-upload-url`, {
      params: {
        fileType: file.type,

        // SEND FOLDER
        folder,
      },
    });

    const { uploadURL, fileURL } = response.data;

    if (!uploadURL || !fileURL) {
      throw new Error("Invalid upload response from server");
    }

    // Upload to S3
    await axios.put(uploadURL, file, {
      headers: {
        "Content-Type": file.type,
      },
    });

    // Return uploaded file URL
    return {
      fileURL,
      key: response.data.key,
    };
  } catch (err) {
    const message = err.response?.data?.error || err.message || "Upload failed";

    console.error("Image upload failed:", message);

    throw new Error(message);
  }
};
export const deleteImage = async (key) => {
  if (!key) return;

  try {
    await axios.delete(`${UPLOAD_API}/delete`, {
      data: { key },
    });

    return true;
  } catch (err) {
    const message = err.response?.data?.error || err.message || "Delete failed";

    console.error("Delete failed:", message);

    throw new Error(message);
  }
};
