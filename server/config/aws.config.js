// server/config/aws.config.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  // No need to hardcode keys if running in AWS or using ~/.aws/credentials
  credentials: process.env.AWS_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined,
});

export const generateUploadURL = async (fileType = "image/jpeg") => {
  const ext = fileType.split("/")[1] || "jpeg";
  const imageName = `${nanoid()}-${Date.now()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME || "blogging-website-co",
    Key: imageName,
    ContentType: fileType,
  });

  return await getSignedUrl(s3, command, { expiresIn: 600 }); // 10 minutes
};
