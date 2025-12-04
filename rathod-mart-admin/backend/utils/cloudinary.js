// backend/utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier"; // Legacy support
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 1. Delete Function
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Cloudinary Delete [${publicId}]:`, result);
    return result;
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
  }
};

// 2. Helper: Extract Public ID from a full Cloudinary URL
export const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  try {
    // Example: https://res.cloudinary.com/demo/image/upload/v12345678/rathod-mart/abc12345.jpg
    const splitUrl = url.split("/");
    const lastPart = splitUrl.pop(); // abc12345.jpg
    const publicId = lastPart.split(".")[0]; // abc12345
    const folder = splitUrl.pop(); // rathod-mart

    // If it's a version number (v1234...), ignore it
    if (folder.startsWith("v")) {
      // Logic for versioned urls might need deeper parsing, but usually folder comes before version
      // Simple setup: folder/publicId
      return publicId;
    }

    return `${folder}/${publicId}`;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
};

// 3. Legacy Server-Side Upload (Optional, kept to prevent import errors in old files)
export const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "rathod-mart" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

export default cloudinary;
