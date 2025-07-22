import jwt from "jsonwebtoken";
import { generateTokens, verifyToken } from "../../../utils/auth.js";
import userSchema from "../schema/user.schema.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body;
    req.body;
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    if (!["admin", "user", "restaurantOwner"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role provided",
        success: false,
      });
    }

    const existingUser = await userSchema.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "Email already in use",
        success: false,
      });
    }

    const user = await userSchema.create({ name, email, password, role });

    const { accessToken, refreshToken } = generateTokens(user._id, user.role); // Include role

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
        success: false,
      });
    }

    // Find user
    const user = await userSchema.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Set cookies (for web)
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 90 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return response (for mobile)
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token required",
        success: false,
      });
    }

    const decoded = await verifyToken(refreshToken);
    const user = await userSchema.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "Invalid refresh token",
        success: false,
      });
    }

    // Generate new tokens
    const { accessToken, newRefreshToken } = generateTokens(
      user._id,
      user.role
    );

    // Set cookies (for web)
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return response (for mobile)
    return res.status(200).json({
      success: true,
      message: "Token refreshed",
      tokens: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(403).json({
      message: "Invalid refresh token",
      success: false,
    });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear cookies (web)
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    // For mobile, client should delete tokens from storage

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await userSchema
      .findById(req.user._id)
      .select("-password -refreshTokens");

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};
