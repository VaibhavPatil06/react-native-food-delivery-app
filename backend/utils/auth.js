// authUtils.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Generate tokens with consistent algorithm
export const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId, role },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};
// Verify tokens with same algorithm
export const verifyToken = (token, isRefresh = false) => {
  try {
    return jwt.verify(
      token,
      isRefresh ? REFRESH_TOKEN_SECRET : ACCESS_TOKEN_SECRET,
      {
        algorithms: ["HS256"], // Explicitly set allowed algorithms
      }
    );
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
};
