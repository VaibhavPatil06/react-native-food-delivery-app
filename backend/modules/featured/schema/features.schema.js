// models/featured.model.js
import mongoose from "mongoose";

const featuredSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  restaurants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
  ],
});

export default mongoose.model("Featured", featuredSchema);
