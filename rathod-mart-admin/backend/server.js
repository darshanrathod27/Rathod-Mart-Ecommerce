import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import connectDB from "./config/database.js";
import cloudinary from "./utils/cloudinary.js"; // Cloudinary import

// routes imports
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import productSizeMappingRoutes from "./routes/productSizeMappingRoutes.js";
import productColorMappingRoutes from "./routes/productColorMappingRoutes.js";
import variantMasterRoutes from "./routes/variantMasterRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import promocodeRoutes from "./routes/promocodeRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();
connectDB();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/health", (req, res) => res.json({ success: true, time: new Date() }));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/product-size-mapping", productSizeMappingRoutes);
app.use("/api/product-color-mapping", productColorMappingRoutes);
app.use("/api/variant-master", variantMasterRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/promocodes", promocodeRoutes);
app.use("/api/orders", orderRoutes);

// Error handlers
app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong",
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
});

app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: `Route ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);

  // Cloudinary Connection Check
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    cloudinary.api
      .ping()
      .then(() => console.log("✅ Cloudinary Connected"))
      .catch((err) =>
        console.error("❌ Cloudinary Connection Failed:", err.message)
      );
  } else {
    console.warn("⚠️ Cloudinary credentials missing in .env");
  }
});
