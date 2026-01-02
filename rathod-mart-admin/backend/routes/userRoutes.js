// backend/routes/userRoutes.js
import express from "express";
import passport from "passport";
import { body, param, validationResult } from "express-validator";
import { protect, protectAdmin, admin } from "../middleware/authMiddleware.js";
import generateToken from "../utils/generateToken.js";
import { sendLoginNotificationEmail } from "../utils/emailService.js";

import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
  loginAdminUser,
  registerUser,
  registerAdminUser,
  logoutUser,
  logoutAdmin,
  getUserProfile,
  updateUserProfile,
  // Password Reset & Change
  forgotPassword,
  resetPassword,
  changePassword,
  adminForgotPassword,
  adminResetPassword,
  adminChangePassword,
} from "../controllers/userController.js";

const router = express.Router();

// -------------------- VALIDATION HANDLER --------------------
const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const first = result.array({ onlyFirstError: true });
  const err = new Error(first.map((e) => `${e.path}: ${e.msg}`).join(", "));
  err.statusCode = 422;
  next(err);
};

// -------------------- RULES --------------------
const createUserRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
  body("phone").optional().isString().isLength({ max: 20 }),
  body("role").optional().isIn(["admin", "manager", "staff", "customer"]),
  body("status").optional().isIn(["active", "inactive", "blocked"]),
];

const updateUserRules = [
  param("id").isMongoId().withMessage("Invalid user id"),
  body("name").optional().trim().notEmpty(),
  body("email").optional().isEmail().withMessage("Valid email required"),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password min 6 chars"),
  body("phone").optional().isString().isLength({ max: 20 }),
  body("role").optional().isIn(["admin", "manager", "staff", "customer"]),
  body("status").optional().isIn(["active", "inactive", "blocked"]),
];

const idParamRule = [param("id").isMongoId().withMessage("Invalid user id")];

// -------------------- PUBLIC AUTH ROUTES --------------------
router.post("/login", loginUser);
router.post("/admin-login", loginAdminUser);
router.post("/register", registerUser);
router.post("/admin-register", registerAdminUser);
router.post("/logout", logoutUser);
router.post("/admin-logout", logoutAdmin);

// -------------------- PASSWORD RESET ROUTES (Public) --------------------
// Customer password reset
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Admin password reset
router.post("/admin-forgot-password", adminForgotPassword);
router.post("/admin-reset-password/:token", adminResetPassword);

// -------------------- GOOGLE OAUTH ROUTES --------------------
// Middleware to check if Google OAuth is configured
const checkGoogleAuth = (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      success: false,
      message: "Google login is not configured. Please use email/password login.",
    });
  }
  next();
};

// Initiate Google OAuth
router.get(
  "/google",
  checkGoogleAuth,
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth Callback
router.get(
  "/google/callback",
  checkGoogleAuth,
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=google_auth_failed`,
  }),
  (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    
    // CRITICAL: Verify user exists before generating token
    if (!req.user?._id) {
      console.error("❌ Google callback: req.user is missing after passport authenticate");
      return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }
    
    console.log("✅ Google callback: Generating token for user:", req.user.email);
    // Generate JWT token for the user
    generateToken(res, req.user._id, "jwt");

    // Send login notification email (async, don't wait)
    sendLoginNotificationEmail(req.user.email, req.user.name, {
      method: "Google Sign-In",
      isAdmin: false,
    });

    // Redirect to frontend with success
    res.redirect(`${frontendUrl}/?google_auth=success`);
  }
);

// -------------------- ADMIN GOOGLE OAUTH ROUTES --------------------
// Initiate Admin Google OAuth
router.get(
  "/admin-google",
  checkGoogleAuth,
  (req, res, next) => {
    // Override the callback URL for admin OAuth
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
    passport.authenticate("google", {
      scope: ["profile", "email"],
      callbackURL: `${backendUrl}/api/users/admin-google/callback`,
    })(req, res, next);
  }
);

// Admin Google OAuth Callback
router.get(
  "/admin-google/callback",
  checkGoogleAuth,
  (req, res, next) => {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
    const adminUrl = process.env.ADMIN_URL || "http://localhost:5173";

    passport.authenticate("google", {
      session: false,
      callbackURL: `${backendUrl}/api/users/admin-google/callback`,
      failureRedirect: `${adminUrl}/login?error=google_auth_failed`,
    })(req, res, next);
  },
  async (req, res) => {
    const adminUrl = process.env.ADMIN_URL || "http://localhost:5173";

    // If user is a customer, upgrade them to staff for admin panel access
    if (req.user.role === "customer") {
      try {
        // Import User model dynamically to avoid circular dependency
        const User = (await import("../models/User.js")).default;
        await User.findByIdAndUpdate(req.user._id, { role: "staff" });
        req.user.role = "staff"; // Update in memory too
        console.log(`✅ Auto-upgraded user ${req.user.email} to staff role for admin panel`);
      } catch (err) {
        console.error("Failed to upgrade user role:", err);
        return res.redirect(`${adminUrl}/login?error=role_upgrade_failed`);
      }
    }

    // Now check if user has admin/manager/staff role (should always pass now)
    if (!["admin", "manager", "staff"].includes(req.user.role)) {
      return res.redirect(`${adminUrl}/login?error=not_authorized`);
    }

    // Check if user is active
    if (req.user.status !== "active") {
      return res.redirect(`${adminUrl}/login?error=account_inactive`);
    }

    // Generate admin JWT token
    generateToken(res, req.user._id, "admin_jwt");

    // Send login notification email (async, don't wait)
    sendLoginNotificationEmail(req.user.email, req.user.name, {
      method: "Google Sign-In",
      isAdmin: true,
    });

    // Redirect to admin panel with success
    res.redirect(`${adminUrl}/?google_auth=success`);
  }
);

// -------------------- CUSTOMER PROFILE ROUTES (Protected) --------------------
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Customer change password (while logged in)
router.post("/change-password", protect, changePassword);

// -------------------- ADMIN PROFILE ROUTE ------------------
router.route("/admin-profile").get(protectAdmin, getUserProfile);

// Admin change password (while logged in)
router.post("/admin-change-password", protectAdmin, adminChangePassword);


// -------------------- ADMIN CRUD ROUTES (Protected + Admin Only) --------------------
router.route("/").get(protectAdmin, admin, getUsers).post(
  protectAdmin,
  admin,
  createUserRules,
  validate,
  createUser
);

router
  .route("/:id")
  .get(protectAdmin, admin, idParamRule, validate, getUserById)
  .put(
    protectAdmin,
    admin,
    updateUserRules,
    validate,
    updateUser
  )
  .delete(protectAdmin, admin, idParamRule, validate, deleteUser);

export default router;

