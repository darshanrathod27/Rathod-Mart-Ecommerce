// backend/routes/paymentRoutes.js
import express from "express";
import {
    createRazorpayOrder,
    verifyPayment,
    getRazorpayKey,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get Razorpay Key ID (public)
router.get("/key", getRazorpayKey);

// Create Razorpay Order (requires authentication)
router.post("/create-order", protect, createRazorpayOrder);

// Verify Payment (requires authentication)
router.post("/verify", protect, verifyPayment);

export default router;
