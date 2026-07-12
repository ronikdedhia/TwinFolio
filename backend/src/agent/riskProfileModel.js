import { ChatGroq } from "@langchain/groq";
import { z } from "zod";

// Not a trained classifier — Groq structured-output reasoning directly over
// behavioral history. See ARCHITECTURE.md's "Why one JS stack" for the
// rationale (no labeled training data exists to train a classifier on anyway,
// and this folds risk scoring + explainability into a single call).

const RiskProfileSchema = z.object({
  riskTolerance: z
    .enum(["conservative", "moderate", "aggressive"])
    .describe("the customer's revealed risk tolerance, based on actual behavior, not self-report"),
  biasFlags: z
    .array(
      z.object({
        type: z
          .string()
          .describe(
            "a short label you generate that precisely matches THIS evidence — do not default to a " +
              "generic/common bias name if it doesn't actually fit (e.g. never label equity or mutual-fund " +
              "concentration as 'fd-overconcentration' just because that's a common label; only use " +
              "'fd-overconcentration' if fixed deposits are specifically what's overconcentrated)"
          ),
        evidence: z.string().describe("the specific event(s) from the customer's history that support this"),
        explanation: z
          .string()
          .describe(
            "personalized coaching grounded in the customer's specific evidence above — reference the " +
              "actual event/numbers, not generic advice-column language like 'diversify your portfolio' " +
              "or 'avoid impulsive decisions' that could apply to anyone"
          ),
      })
    )
    .describe("behavioral biases detected from the event history — empty array if none found"),
  reasoning: z
    .string()
    .describe("brief overall reasoning tying the events to the risk tolerance conclusion"),
});

/**
 * Analyzes a customer's behavioral event history and returns a structured,
 * schema-constrained risk/bias assessment. Near-zero temperature so the
 * output shape (if not the exact wording) stays reproducible — this feeds
 * an audit-logged, regulated-adjacent recommendation, so determinism matters
 * more here than in free-form conversation.
 */
export async function assessRiskProfile(events) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set — add it to .env before using the risk profile model");
  }
  if (!Array.isArray(events) || events.length === 0) {
    throw new Error("events must be a non-empty array");
  }

  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    temperature: 0,
  }).withStructuredOutput(RiskProfileSchema);

  const eventsText = events
    .map((e) => `- [${e.date}] (${e.type}) ${e.description}`)
    .join("\n");

  const prompt =
    `Analyze this customer's actual financial behavior history and infer their real risk tolerance ` +
    `and any behavioral biases — not from what they'd say about themselves, but from what they've ` +
    `actually done. Every bias label and explanation must be specific to the evidence given below, ` +
    `not a generic label or generic advice reused from a common list of bias types.\n\n` +
    `Event history:\n${eventsText}`;

  return model.invoke(prompt);
}
