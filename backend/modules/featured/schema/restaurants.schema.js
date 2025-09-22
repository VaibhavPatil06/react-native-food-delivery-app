// models/restaurant.model.js
import mongoose from "mongoose";

const dishSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  name: {
    type: String,
    required: true,
  },
  description: String,
  price: {
    type: Number,
    required: true,
  },
  image: String,
});

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  description: String,
  latitude: Number,
  longitude: Number,
  address: String,
  stars: Number,
  reviews: String,
  categories: String,
  dishes: [dishSchema],
});

export default mongoose.model("Restaurant", restaurantSchema);
