import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // You missed this import

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "user", "restaurantOwner"],
      default: "user",
    },
    refreshTokens: [String], // For refresh token rotation
    lastLogin: Date,
    deviceTokens: [String], // For mobile push notifications
  },
  { timestamps: true }
);

// Password hashing
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Password comparison
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Generate tokens
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { userId: this._id, role: this.role }, // include role
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
  return token;
};

userSchema.methods.generateRefreshToken = function () {
  const token = jwt.sign(
    { userId: this._id, role: this.role }, // include role
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  return token;
};

export default mongoose.model("User", userSchema);
