import mongoose from "mongoose";

const conversationLogSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  message: { type: String, required: true },
  reply: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const ConversationLog =
  mongoose.models.ConversationLog || mongoose.model("ConversationLog", conversationLogSchema);
