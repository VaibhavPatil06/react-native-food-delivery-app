import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log(`MongoDB connected to server ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit the process with failure code
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB disconnected");
  } catch (error) {
    console.error(`Error disconnecting from MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
