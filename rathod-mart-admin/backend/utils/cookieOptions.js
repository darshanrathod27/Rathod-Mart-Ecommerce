// backend/utils/cookieOptions.js
// Centralized cookie configuration for consistent behavior across local and production

/**
 * Get consistent cookie options for HTTP-only auth cookies.
 * This ensures cookies are properly set AND cleared with identical attributes,
 * which is required for cross-origin HTTPS deployments (like Render).
 * 
 * @param {number} maxAge - Cookie max age in milliseconds. Use 0 or negative to expire/clear the cookie.
 * @returns {Object} Cookie options object
 */
export const getCookieOptions = (maxAge = 30 * 24 * 60 * 60 * 1000) => {
    const isProduction = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: isProduction, // HTTPS only in production
        sameSite: isProduction ? "none" : "lax", // "none" required for cross-origin cookies
        ...(maxAge > 0 ? { maxAge } : { expires: new Date(0) }),
    };
};

export default getCookieOptions;
