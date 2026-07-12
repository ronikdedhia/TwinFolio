import mongoose from "mongoose";

const biasFlagSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    evidence: { type: String, required: true },
    explanation: { type: String, required: true },
  },
  { _id: false }
);

const riskAssessmentSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  riskTolerance: { type: String, enum: ["conservative", "moderate", "aggressive"], required: true },
  biasFlags: { type: [biasFlagSchema], default: [] },
  reasoning: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const RiskAssessment =
  mongoose.models.RiskAssessment || mongoose.model("RiskAssessment", riskAssessmentSchema);
