// backend/utils/passwordUtils.js
import crypto from "crypto";

/**
 * Generate a secure random token for password reset
 * @returns {Object} { token, hashedToken }
 */
export const generateResetToken = () => {
  // Generate a random 32-byte token
  const token = crypto.randomBytes(32).toString("hex");
  
  // Hash the token for secure storage in DB
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  
  return { token, hashedToken };
};

/**
 * Hash a token for comparison
 * @param {string} token - The plain token to hash
 * @returns {string} Hashed token
 */
export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Calculate the expiration time for password reset
 * @param {number} minutes - Minutes until expiration (default: 10)
 * @returns {Date} Expiration date
 */
export const getResetExpiration = (minutes = 10) => {
  const expirationMinutes = parseInt(process.env.PASSWORD_RESET_EXPIRES_MINUTES) || minutes;
  return new Date(Date.now() + expirationMinutes * 60 * 1000);
};

/**
 * Create a password reset URL for customer frontend
 * @param {string} token - The reset token
 * @returns {string} Full reset URL
 */
export const createPasswordResetUrl = (token) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  return `${frontendUrl}/reset-password/${token}`;
};

/**
 * Create a password reset URL for admin frontend
 * @param {string} token - The reset token
 * @returns {string} Full reset URL
 */
export const createAdminPasswordResetUrl = (token) => {
  const adminUrl = process.env.ADMIN_URL || "http://localhost:5173";
  return `${adminUrl}/reset-password/${token}`;
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} { isValid, errors }
 */
export const validatePasswordStrength = (password) => {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[@$!%*?&]/.test(password)) {
    errors.push("Password must contain at least one special character (@$!%*?&)");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  generateResetToken,
  hashToken,
  getResetExpiration,
  createPasswordResetUrl,
  createAdminPasswordResetUrl,
  validatePasswordStrength,
};
