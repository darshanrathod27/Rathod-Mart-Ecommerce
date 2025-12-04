// backend/middleware/productUpload.js
import multer from "multer";

// Hum MemoryStorage use karenge taaki file RAM mein aaye aur phir Cloudinary par jaye
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

export const uploadProductImages = upload.array("images", 15);
export default upload;
