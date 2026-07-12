import "../env.js";
import mongoose from "mongoose";

let connectionPromise = null;

export function connectMongo() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be set in .env");
  }
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI);
  }
  return connectionPromise;
}
