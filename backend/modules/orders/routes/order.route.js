import express from 'express'
import { createOrder, getMyOrders, getOrderById } from '../controllers/order.controller.js';
import { authenticateToken } from '../../../middleware/authMiddleware.js';

const orderRouter = express.Router()
orderRouter.use(authenticateToken);
// Create new order
orderRouter.post("/create-order",createOrder);

// Get user's orders
orderRouter.get("/my-orders", getMyOrders);
orderRouter.get("/:orderId", authenticateToken, getOrderById);
export default orderRouter;
