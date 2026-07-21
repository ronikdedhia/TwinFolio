import mongoose from "mongoose";

const nudgeSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  basis: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Nudge = mongoose.models.Nudge || mongoose.model("Nudge", nudgeSchema);
