// src/lib/dbConnect.js
import mongoose from 'mongoose';

const getEnv = (key) => {
  // 优先 Node.js 本地环境变量（如 Windows 的 set、PowerShell 的 $env:，或 Linux/Mac 的 export）
  if (typeof process !== 'undefined' && process.env && Object.prototype.hasOwnProperty.call(process.env, key)) {
    return process.env[key];
  }
  // 其次 .env.local，再尝试 .env
  const tryReadEnvFile = (filename) => {
    try {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.resolve(process.cwd(), filename);
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const lines = envContent.split(/\r?\n/);
        for (const line of lines) {
          const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
          if (match && match[1] === key) {
            return match[2];
          }
        }
      }
    } catch {}
    return undefined;
  };
  return tryReadEnvFile('.env.local') || tryReadEnvFile('.env');
};

const MONGODB_URI = getEnv('MONGODB_URI');

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