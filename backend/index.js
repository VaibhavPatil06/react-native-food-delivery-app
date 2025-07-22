import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { authenticateToken } from "./middleware/authMiddleware.js";
import connectDB, { disconnectDB } from "./database/mongoDB.js";
import router from "./modules/user/routes/user.route.js";
import categoryRoutes from "./modules/category/routes/category.routes.js";
import featuredRoutes from "./modules/featured/routes/featured.routes.js";
import orderRouter from "./modules/orders/routes/order.route.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:8081",
  "http://localhost:19006", // React Native dev server
  "exp://your-device-ip:19000", // Expo dev client
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    exposedHeaders: ["set-cookie", "Authorization"],
  })
);

// Serve uploads
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Routes
app.use("/api/auth", router);
app.use("/api/categories", categoryRoutes);
app.use("/api/featured", featuredRoutes);
app.use("/api/order",orderRouter)
// Protected route example
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({ message: "Protected data", user: req.user });
});

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Healthcheck pass!", success: true });
});

let server = app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  server.close(async () => {
    console.log("Server closed (SIGINT)");
    await disconnectDB();
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  server.close(async () => {
    console.log("Server closed (SIGTERM)");
    await disconnectDB();
    process.exit(0);
  });
});
