import express from "express";
import {
  addDish,
  addRestaurant,
  deleteDish,
  getFeatured,
  getRestaurantDishes,
  getRestaurantOrders,
  my,
  updateDish,
  updateOrderStatus,
} from "../controllers/featured.controller.js";
import { upload } from "../../../middleware/multer.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../../../middleware/authMiddleware.js";

const featuredRoutes = express.Router();

featuredRoutes.get("/", getFeatured);
featuredRoutes.post(
  "/restaurants-add",
  authenticateToken,
  upload.single("image"),
  addRestaurant
);

// Upload dish with image
featuredRoutes.post(
  "/restaurant/dishes",
  authenticateToken,
  upload.single("image"),
  addDish
);

// Update a specific dish
featuredRoutes.post(
  "/update-dish",
  authenticateToken,
  upload.single("image"),
  updateDish
);

// Delete a specific dish
featuredRoutes.delete("/restaurant/dishes", authenticateToken, deleteDish);

// Get current owner's restaurant
featuredRoutes.get(
  "/my",
  authenticateToken,
  authorizeRoles("restaurantOwner"),
  my
);
featuredRoutes.get(
  "/restaurant/dishes",
  authenticateToken,
  getRestaurantDishes
);
featuredRoutes.get(
  "/restaurant/orders",
  authenticateToken,
  getRestaurantOrders
);

featuredRoutes.patch("/order", updateOrderStatus);
export default featuredRoutes;
