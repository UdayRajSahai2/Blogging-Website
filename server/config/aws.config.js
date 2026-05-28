// server/config/aws.config.js

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { nanoid } from "nanoid";

export const s3 = new S3Client({
  region: process.env.AWS_REGION,

  // No need to hardcode keys
  // if running in AWS or using ~/.aws/credentials

  credentials: process.env.AWS_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY,

        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined,
});

export const generateUploadURL = async (
  fileType = "image/jpeg",

  // DEFAULT = EXISTING BLOG FOLDER
  folder = "blog-banner-upload",
) => {
  const ext = fileType.split("/")[1] || "jpeg";

  const imageName = `${nanoid()}-${Date.now()}.${ext}`;

  // DYNAMIC FOLDER
  const key = `${folder}/${imageName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME || "reach-foundation-bucket",

    Key: key,

    ContentType: fileType,
  });

  const uploadURL = await getSignedUrl(s3, command, {
    expiresIn: 600,
  });

  return {
    uploadURL,
    key,
  };
};
