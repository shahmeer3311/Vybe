import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...", process.env.MONGODB_URL);
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB Connected:", conn.connection.host);
  } catch (error) {
    console.error("MongoDB error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
