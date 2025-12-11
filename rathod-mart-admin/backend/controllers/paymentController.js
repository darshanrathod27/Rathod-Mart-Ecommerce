// backend/controllers/paymentController.js
import Razorpay from "razorpay";
import crypto from "crypto";
import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/Order.js";

// Initialize Razorpay instance
const getRazorpayInstance = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error("Razorpay credentials not configured");
    }
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
export const createRazorpayOrder = asyncHandler(async (req, res) => {
    const { amount, orderId } = req.body;

    if (!amount || amount <= 0) {
        res.status(400);
        throw new Error("Invalid amount");
    }

    const razorpay = getRazorpayInstance();

    const options = {
        amount: Math.round(amount * 100), // Razorpay expects paise (1 INR = 100 paise)
        currency: "INR",
        receipt: `order_${orderId || Date.now()}`,
        notes: {
            orderId: orderId || "pending",
            userId: req.user._id.toString(),
        },
    };

    try {
        const razorpayOrder = await razorpay.orders.create(options);

        res.json({
            success: true,
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error("Razorpay order creation error:", error);
        res.status(500);
        throw new Error("Failed to create payment order");
    }
});

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = asyncHandler(async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        res.status(400);
        throw new Error("Missing payment verification data");
    }

    // Verify signature using HMAC SHA256
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(sign)
        .digest("hex");

    if (razorpay_signature !== expectedSign) {
        res.status(400);
        throw new Error("Payment verification failed - Invalid signature");
    }

    // Update order as paid
    if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: razorpay_payment_id,
                status: "completed",
                update_time: new Date().toISOString(),
            };
            await order.save();
        }
    }

    res.json({
        success: true,
        message: "Payment verified successfully",
        paymentId: razorpay_payment_id,
    });
});

// @desc    Get Razorpay Key ID (for frontend)
// @route   GET /api/payments/key
// @access  Public
export const getRazorpayKey = asyncHandler(async (req, res) => {
    res.json({
        success: true,
        keyId: process.env.RAZORPAY_KEY_ID,
    });
});
