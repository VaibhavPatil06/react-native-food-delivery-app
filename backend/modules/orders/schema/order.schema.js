import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  items: [
    {
      dishId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dish",
        required: true,
      },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  status: {
    type: String,
    enum: ["preparing", "on-the-way", "delivered", "cancelled"],
    default: "preparing",
  },
  deliveryAddress: { type: String, required: false },
  paymentMethod: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Order", orderSchema);
