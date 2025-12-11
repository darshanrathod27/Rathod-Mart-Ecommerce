// ============================================================
// RATHOD MART - BACKEND SERVER
// Production-Ready Express Server for Render Deployment
// ============================================================

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import passport from "passport";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

// Config & Utils
import connectDB from "./config/database.js";
import cloudinary from "./utils/cloudinary.js";
import configurePassport from "./config/passport.js";

// Route Imports
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
import paymentRoutes from "./routes/paymentRoutes.js";

// ============================================================
// CONFIGURATION
// ============================================================

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === "production";

// ============================================================
// SECURITY MIDDLEWARE
// ============================================================

// Helmet - Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);

// Trust proxy for Render (required for rate limiting behind proxy)
app.set("trust proxy", 1);

// Rate Limiting - Prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 100 : 1000, // Limit requests per window
  message: {
    success: false,
    message: "Too many requests, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/health", // Skip health checks
});

// Auth Rate Limiting - Stricter for login/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 10 : 100, // 10 attempts per 15 min
  message: {
    success: false,
    message: "Too many login attempts, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting
app.use(limiter);

// ============================================================
// CORS CONFIGURATION
// ============================================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter(Boolean); // Remove undefined/null values

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS blocked origin: ${origin}`);
        callback(null, true); // Allow in production for flexibility
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// ============================================================
// PERFORMANCE MIDDLEWARE
// ============================================================

// Compression - Gzip responses
app.use(
  compression({
    level: 6, // Balanced compression
    threshold: 1024, // Only compress responses > 1KB
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    },
  })
);

// Request Logging
if (isProduction) {
  // Minimal logging in production
  app.use(morgan("combined"));
} else {
  // Detailed logging in development
  app.use(morgan("dev"));
}

// ============================================================
// BODY PARSERS
// ============================================================

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// ============================================================
// PASSPORT (Google OAuth)
// ============================================================

configurePassport();
app.use(passport.initialize());

// ============================================================
// STATIC FILES
// ============================================================

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ============================================================
// HEALTH CHECK & ROOT ROUTES
// ============================================================

// Root route - API info
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Rathod Mart Backend API is running!",
    version: "2.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "GET /health",
      api: "/api/*",
      docs: "See README.md for API documentation",
    },
    links: {
      store: process.env.FRONTEND_URL || "http://localhost:3000",
      admin: process.env.ADMIN_URL || "http://localhost:5173",
    },
  });
});

// Health check - For Render health monitoring
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB",
    },
  });
});

// ============================================================
// API ROUTES
// ============================================================

// Apply stricter rate limiting to auth routes
app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);
app.use("/api/users/admin-login", authLimiter);

// Main API routes
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
app.use("/api/payments", paymentRoutes);

// ============================================================
// ERROR HANDLERS
// ============================================================

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);

  if (!isProduction) {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong",
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    suggestion: "Check API documentation or visit /health for status",
  });
});

// ============================================================
// SERVER STARTUP
// ============================================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    app.listen(PORT, () => {
      console.log("");
      console.log("🛒 Rathod Mart Backend Server");
      console.log(`   Server:   http://localhost:${PORT}`);
      console.log(`   Mode:     ${isProduction ? "Production" : "Development"}`);
      console.log("");

      // Cloudinary Connection Check
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        cloudinary.api
          .ping()
          .then(() => console.log("✅ Cloudinary Connected"))
          .catch((err) => console.error("❌ Cloudinary Error:", err.message));
      } else {
        console.warn("⚠️  Cloudinary credentials missing");
      }
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err.message);
  if (isProduction) {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

// Start the server
startServer();
