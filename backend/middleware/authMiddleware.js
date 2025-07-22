// authMiddleware.js
import userSchema from "../modules/user/schema/user.schema.js";
import { verifyToken } from "../utils/auth.js";

export const authenticateToken = async (req, res, next) => {
  try {
    // Check for token in cookies first (web)
    let token = req.cookies?.accessToken;

    // If not in cookies, check Authorization header (mobile)
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Verify token using consistent method
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(403).json({
        message: "Invalid token",
        success: false,
      });
    }

    const user = await userSchema.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        message: "User not found",
        success: false,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({
      message: "Authentication failed",
      success: false,
    });
  }
};
// middlewares/authorizeRoles.js
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient role" });
    }
    next();
  };
};

