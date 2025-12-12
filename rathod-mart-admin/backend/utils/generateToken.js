// backend/utils/generateToken.js
import jwt from "jsonwebtoken";
import { getCookieOptions } from "./cookieOptions.js";

const generateToken = (res, userId, cookieName = "jwt") => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  // Set JWT as an HTTP-Only cookie with consistent cross-origin options
  res.cookie(cookieName, token, getCookieOptions());
};

export default generateToken;

