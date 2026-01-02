// backend/controllers/userController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import { getCookieOptions } from "../utils/cookieOptions.js";
import {
  deleteFromCloudinary,
  getPublicIdFromUrl,
} from "../utils/cloudinary.js";
import {
  generateResetToken,
  hashToken,
  getResetExpiration,
  createPasswordResetUrl,
  createAdminPasswordResetUrl,
  validatePasswordStrength,
} from "../utils/passwordUtils.js";
import {
  sendPasswordResetEmail,
  sendAdminPasswordResetEmail,
  sendPasswordChangedEmail,
  sendLoginNotificationEmail,
} from "../utils/emailService.js";

const ah = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const SORT_ALLOW = new Set([
  "name",
  "email",
  "role",
  "status",
  "createdAt",
  "updatedAt",
]);

// --- AUTH ---
export const loginAdminUser = ah(async (req, res) => {
  const { email, password } = req.body;
  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    generateToken(res, "SUPER_ADMIN_ID", "admin_jwt");
    return res.json({
      _id: "SUPER_ADMIN_ID",
      name: "Super Admin",
      email: process.env.ADMIN_EMAIL,
      role: "admin",
      status: "active",
    });
  }
  const user = await User.findOne({ email }).select("+password");
  if (user && (await bcrypt.compare(password, user.password))) {
    if (["admin", "manager", "staff"].includes(user.role)) {
      if (user.status !== "active") {
        res.status(401);
        throw new Error("Account inactive");
      }
      generateToken(res, user._id, "admin_jwt");
      const userObj = user.toObject();
      delete userObj.password;
      
      // Send login notification email (async, don't wait)
      sendLoginNotificationEmail(user.email, user.name, {
        method: "Email/Password",
        isAdmin: true,
      });
      
      return res.json(userObj);
    } else {
      res.status(401);
      throw new Error("Not authorized");
    }
  }
  res.status(401);
  throw new Error("Invalid email or password");
});

export const loginUser = ah(async (req, res) => {
  const { email, password } = req.body;
  const dbUser = await User.findOne({ email }).select("+password");
  if (dbUser && (await bcrypt.compare(password, dbUser.password))) {
    if (dbUser.status !== "active") {
      res.status(401);
      throw new Error("Account inactive");
    }
    generateToken(res, dbUser._id, "jwt");
    const user = dbUser.toObject();
    delete user.password;
    
    // Send login notification email (async, don't wait)
    sendLoginNotificationEmail(dbUser.email, dbUser.name, {
      method: "Email/Password",
      isAdmin: false,
    });
    
    res.json(user);
  } else {
    res.status(401);
    throw new Error("Invalid credentials");
  }
});

export const logoutAdmin = ah(async (req, res) => {
  // Use getCookieOptions(0) to clear cookie with matching attributes for cross-origin
  res.cookie("admin_jwt", "", getCookieOptions(0));
  res.status(200).json({ message: "Logged out" });
});

export const logoutUser = ah(async (req, res) => {
  // Use getCookieOptions(0) to clear cookie with matching attributes for cross-origin
  res.cookie("jwt", "", getCookieOptions(0));
  res.status(200).json({ message: "Logged out" });
});

// --- CRUD ---
export const registerUser = ah(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) {
    res.status(400);
    throw new Error("User exists");
  }
  const user = await User.create({
    name,
    email,
    password,
    role: "customer",
    status: "active",
  });
  if (user) {
    generateToken(res, user._id, "jwt");
    res
      .status(201)
      .json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
  } else {
    res.status(400);
    throw new Error("Invalid data");
  }
});

// Admin/Staff Registration (Public endpoint for admin panel signup)
export const registerAdminUser = ah(async (req, res) => {
  const { name, email, password, role = "staff" } = req.body;

  // Validate role - only allow admin, manager, or staff
  if (!["admin", "manager", "staff"].includes(role)) {
    res.status(400);
    throw new Error("Invalid role. Must be admin, manager, or staff");
  }

  // Check if user already exists
  if (await User.findOne({ email })) {
    res.status(400);
    throw new Error("User with this email already exists");
  }

  // Validate required fields
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  // Create the user
  const user = await User.create({
    name,
    email,
    password,
    role,
    status: "active",
  });

  if (user) {
    // Generate admin JWT token
    generateToken(res, user._id, "admin_jwt");
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

export const getUserProfile = ah(async (req, res) => {
  if (req.user) res.json(req.user);
  else {
    res.status(404);
    throw new Error("User not found");
  }
});

export const updateUserProfile = ah(async (req, res) => {
  if (req.user._id === "SUPER_ADMIN_ID") {
    res.status(403);
    throw new Error("Super Admin cannot be modified");
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, username, phone, birthday, password, address, profileImage } =
    req.body;

  // Handle Image Update (Delete Old)
  if (profileImage && profileImage !== user.profileImage) {
    if (user.profileImage) {
      const pid = getPublicIdFromUrl(user.profileImage);
      if (pid) await deleteFromCloudinary(pid);
    }
    user.profileImage = profileImage;
  }

  if (username && username !== user.username) {
    if (await User.findOne({ username, _id: { $ne: user._id } })) {
      res.status(409);
      throw new Error("Username taken");
    }
    user.username = username;
  }
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (birthday) user.birthday = birthday;
  if (address) user.address = { ...user.address, ...address };
  if (password) user.password = password;

  const updated = await user.save();
  res.json(updated);
});

export const createUser = ah(async (req, res) => {
  const { email, username, ...rest } = req.body;
  if (await User.findOne({ email })) {
    res.status(409);
    throw new Error("Email exists");
  }
  if (username && (await User.findOne({ username }))) {
    res.status(409);
    throw new Error("Username exists");
  }

  // Direct Create from JSON (Image URL is in req.body)
  const user = await User.create(req.body);
  res.status(201).json({ success: true, data: user });
});

export const getUsers = ah(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    role,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
    dateFrom,
    dateTo,
  } = req.query;
  const p = Math.max(parseInt(page) || 1, 1);
  const l = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
  const filter = {};

  if (search) {
    const r = { $regex: search, $options: "i" };
    filter.$or = [{ name: r }, { email: r }, { phone: r }, { username: r }];
  }
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(dateTo);
  }

  const sort = {
    [SORT_ALLOW.has(sortBy) ? sortBy : "createdAt"]:
      String(sortOrder) === "asc" ? 1 : -1,
  };
  const [items, total] = await Promise.all([
    User.find(filter)
      .sort(sort)
      .skip((p - 1) * l)
      .limit(l),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) },
  });
});

export const getUserById = ah(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ success: true, data: user });
});

export const updateUser = ah(async (req, res) => {
  const { id } = req.params;
  const update = { ...req.body };

  if (
    update.email &&
    (await User.findOne({ email: update.email, _id: { $ne: id } }))
  ) {
    res.status(409);
    throw new Error("Email in use");
  }
  if (
    update.username &&
    (await User.findOne({ username: update.username, _id: { $ne: id } }))
  ) {
    res.status(409);
    throw new Error("Username in use");
  }

  if (update.password) {
    const salt = await bcrypt.genSalt(12);
    update.password = await bcrypt.hash(update.password, salt);
  } else {
    delete update.password;
  }

  // Delete Old Image if Updated
  if (update.profileImage) {
    const curr = await User.findById(id);
    if (
      curr &&
      curr.profileImage &&
      curr.profileImage !== update.profileImage
    ) {
      const pid = getPublicIdFromUrl(curr.profileImage);
      if (pid) await deleteFromCloudinary(pid);
    }
  }

  const user = await User.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ success: true, data: user });
});

export const deleteUser = ah(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.profileImage) {
    const pid = getPublicIdFromUrl(user.profileImage);
    if (pid) await deleteFromCloudinary(pid);
  }

  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "User deleted" });
});

// ==================== PASSWORD RESET & CHANGE ====================

/**
 * Forgot Password (Customer) - Sends reset email
 * POST /api/users/forgot-password
 */
export const forgotPassword = ah(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Please provide your email address");
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  // Security: Don't reveal if user exists or not
  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If an account exists with this email, you will receive a password reset link.",
    });
  }

  // Check if user uses Google OAuth only
  if (user.authProvider === "google" && !user.password) {
    res.status(400);
    throw new Error("This account uses Google Sign-In. Please log in with Google.");
  }

  // Generate reset token
  const { token, hashedToken } = generateResetToken();

  // Save hashed token and expiration to user
  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = getResetExpiration(10); // 10 minutes
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = createPasswordResetUrl(token);

  try {
    // Send email
    await sendPasswordResetEmail(user.email, resetUrl, user.name);

    res.status(200).json({
      success: true,
      message: "Password reset link has been sent to your email.",
    });
  } catch (error) {
    // If email fails, clear the reset token
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    console.error("Email send error:", error);
    res.status(500);
    throw new Error("Failed to send email. Please try again later.");
  }
});

/**
 * Reset Password (Customer) - Validates token and updates password
 * POST /api/users/reset-password/:token
 */
export const resetPassword = ah(async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    res.status(400);
    throw new Error("Please provide password and confirm password");
  }

  if (password !== confirmPassword) {
    res.status(400);
    throw new Error("Passwords do not match");
  }

  // Validate password strength
  const { isValid, errors } = validatePasswordStrength(password);
  if (!isValid) {
    res.status(400);
    throw new Error(errors.join(". "));
  }

  // Hash the token to compare with DB
  const hashedToken = hashToken(token);

  // Find user with valid token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired reset token. Please request a new password reset.");
  }

  // Update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = new Date();
  await user.save();

  // Send confirmation email
  try {
    await sendPasswordChangedEmail(user.email, user.name);
  } catch (e) {
    console.warn("Failed to send password changed email:", e.message);
  }

  res.status(200).json({
    success: true,
    message: "Password has been reset successfully. You can now log in with your new password.",
  });
});

/**
 * Change Password (Customer - while logged in)
 * POST /api/users/change-password
 */
export const changePassword = ah(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    res.status(400);
    throw new Error("Please provide current password, new password, and confirm password");
  }

  if (newPassword !== confirmPassword) {
    res.status(400);
    throw new Error("New passwords do not match");
  }

  // Validate password strength
  const { isValid, errors } = validatePasswordStrength(newPassword);
  if (!isValid) {
    res.status(400);
    throw new Error(errors.join(". "));
  }

  // Get user with password
  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Check if user has a password (not Google OAuth only)
  if (!user.password) {
    res.status(400);
    throw new Error("This account uses Google Sign-In. Password change is not available.");
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  // Update password
  user.password = newPassword;
  user.passwordChangedAt = new Date();
  await user.save();

  // Send confirmation email
  try {
    await sendPasswordChangedEmail(user.email, user.name);
  } catch (e) {
    console.warn("Failed to send password changed email:", e.message);
  }

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

/**
 * Admin Forgot Password - Sends reset email
 * POST /api/users/admin-forgot-password
 */
export const adminForgotPassword = ah(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Please provide your email address");
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  // Security: Don't reveal if user exists or not
  if (!user || !["admin", "manager", "staff"].includes(user.role)) {
    return res.status(200).json({
      success: true,
      message: "If an admin account exists with this email, you will receive a password reset link.",
    });
  }

  // Check if user uses Google OAuth only
  if (user.authProvider === "google" && !user.password) {
    res.status(400);
    throw new Error("This account uses Google Sign-In. Please log in with Google.");
  }

  // Generate reset token
  const { token, hashedToken } = generateResetToken();

  // Save hashed token and expiration to user
  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = getResetExpiration(10);
  await user.save({ validateBeforeSave: false });

  // Create admin reset URL
  const resetUrl = createAdminPasswordResetUrl(token);

  try {
    await sendAdminPasswordResetEmail(user.email, resetUrl, user.name);

    res.status(200).json({
      success: true,
      message: "Password reset link has been sent to your email.",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    console.error("Admin email send error:", error);
    res.status(500);
    throw new Error("Failed to send email. Please try again later.");
  }
});

/**
 * Admin Reset Password - Validates token and updates password
 * POST /api/users/admin-reset-password/:token
 */
export const adminResetPassword = ah(async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    res.status(400);
    throw new Error("Please provide password and confirm password");
  }

  if (password !== confirmPassword) {
    res.status(400);
    throw new Error("Passwords do not match");
  }

  // Validate password strength
  const { isValid, errors } = validatePasswordStrength(password);
  if (!isValid) {
    res.status(400);
    throw new Error(errors.join(". "));
  }

  const hashedToken = hashToken(token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
    role: { $in: ["admin", "manager", "staff"] },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired reset token. Please request a new password reset.");
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = new Date();
  await user.save();

  try {
    await sendPasswordChangedEmail(user.email, user.name);
  } catch (e) {
    console.warn("Failed to send password changed email:", e.message);
  }

  res.status(200).json({
    success: true,
    message: "Password has been reset successfully. You can now log in with your new password.",
  });
});

/**
 * Admin Change Password (while logged in)
 * POST /api/users/admin-change-password
 */
export const adminChangePassword = ah(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Super Admin cannot change password this way
  if (req.user._id === "SUPER_ADMIN_ID") {
    res.status(403);
    throw new Error("Super Admin password must be changed via environment variables");
  }

  if (!currentPassword || !newPassword || !confirmPassword) {
    res.status(400);
    throw new Error("Please provide current password, new password, and confirm password");
  }

  if (newPassword !== confirmPassword) {
    res.status(400);
    throw new Error("New passwords do not match");
  }

  const { isValid, errors } = validatePasswordStrength(newPassword);
  if (!isValid) {
    res.status(400);
    throw new Error(errors.join(". "));
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!user.password) {
    res.status(400);
    throw new Error("This account uses Google Sign-In. Password change is not available.");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  user.password = newPassword;
  user.passwordChangedAt = new Date();
  await user.save();

  try {
    await sendPasswordChangedEmail(user.email, user.name);
  } catch (e) {
    console.warn("Failed to send password changed email:", e.message);
  }

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});
