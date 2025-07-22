import orderSchema from "../schema/order.schema.js";
import mongoose from "mongoose";
export const createOrder = async (req, res) => {
  try {
    const {
      restaurantId,
      items,
      totalAmount,
      deliveryFee,
      deliveryAddress,
      paymentMethod,
    } = req.body;
      // Validate required fields
    if (
      !restaurantId ||
      !items ||
      !totalAmount ||
      !paymentMethod
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const order = new orderSchema({
      userId: req.user.id,
      restaurantId,
      items: items.map((item) => ({
        dishId: item.dishId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount,
      deliveryFee: deliveryFee || 0,
      deliveryAddress : deliveryAddress || "" ,
      paymentMethod,
      status: "preparing",
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Server error creating order" });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    // This ensures models are registered

    const orders = await orderSchema.find({ userId: req.user.id })
      .populate({
        path: "restaurantId",
        select: "name image",
        model: "Restaurant", // Explicitly specify the model
      })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Server error fetching orders" });
  }
};
export const getOrderById = async (req, res) => {
  try {
    const order = await orderSchema.findById(req.params.orderId)
      .populate({
        path: "restaurantId",
        select: "name image address",
        model: "Restaurant",
      })

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Verify the order belongs to the requesting user
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized access to order" });
    }

    res.json(order);
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ error: "Server error fetching order details" });
  }
};
