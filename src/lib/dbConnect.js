// src/lib/dbConnect.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // useNewUrlParser: true, // No longer necessary in Mongoose 6+
      // useUnifiedTopology: true, // No longer necessary in Mongoose 6+
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("MongoDB Connected!");
      return mongooseInstance;
    }).catch(error => {
      console.error("MongoDB Connection Error:", error);
      throw error; // Re-throw the error to indicate connection failure
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Reset promise on error so a new attempt can be made
    throw e;
  }

  return cached.conn;
}

export default dbConnect;