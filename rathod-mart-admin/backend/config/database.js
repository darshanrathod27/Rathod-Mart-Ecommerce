// ============================================================
// DATABASE CONNECTION - MongoDB Atlas
// Production-Ready Configuration for Render
// ============================================================

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // MongoDB connection options for production
    const options = {
      maxPoolSize: 10, // Maximum connections in pool
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Timeout for socket operations
      family: 4, // Use IPv4
    };

    const conn = await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/rathod_mart_admin",
      options
    );

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Connection event handlers
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected");
    });

    return conn;
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error.message);
    throw error; // Let server.js handle the error
  }
};

export default connectDB;
