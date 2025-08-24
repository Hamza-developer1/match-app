import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

// Cache the connection promise
let cachedConnection: Promise<typeof mongoose> | null = null;

async function connectToDatabase() {
  const startTime = Date.now();
  
  // If already connected, return immediately
  if (mongoose.connection.readyState >= 1) {
    console.log(`🔗 MongoDB: Already connected (${Date.now() - startTime}ms)`);
    return mongoose;
  }

  // If connection is in progress, wait for it
  if (cachedConnection) {
    console.log("🔗 MongoDB: Waiting for existing connection...");
    const connection = await cachedConnection;
    console.log(`🔗 MongoDB: Reused cached connection (${Date.now() - startTime}ms)`);
    return connection;
  }

  try {
    console.log("🔗 MongoDB: Creating new connection...");
    // Create and cache the connection promise
    cachedConnection = mongoose.connect(MONGODB_URI, {
      bufferCommands: true, // Enable buffering to prevent the error
      maxPoolSize: 10, // Maximum number of connections
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      family: 4 // Use IPv4, skip trying IPv6
    });

    const connection = await cachedConnection;
    const totalTime = Date.now() - startTime;
    console.log(`✅ MongoDB: Connected successfully (${totalTime}ms)`);
    return connection;
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ MongoDB: Connection failed after ${totalTime}ms:`, error);
    cachedConnection = null; // Reset cache on error
    throw error;
  }
}

export default connectToDatabase;