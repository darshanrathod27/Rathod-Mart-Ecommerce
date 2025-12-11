// backend/utils/generateToken.js
import jwt from "jsonwebtoken";

const generateToken = (res, userId, cookieName = "jwt") => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  // Set JWT as an HTTP-Only cookie
  const isProduction = process.env.NODE_ENV === "production";
  
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: isProduction, // Use secure cookies in production (HTTPS required)
    sameSite: isProduction ? "none" : "lax", // "none" required for cross-origin cookies in production
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export default generateToken;
