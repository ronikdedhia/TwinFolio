import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { runMonteCarloSimulation, requiredMonthlyContribution } from "../services/simulationEngine.js";

/**
 * Builds the agent's tool set for a single request, closed over the
 * customer's actual profile — the LLM supplies *overrides* (the "what if"
 * part), never the base numbers, so it can't hallucinate a customer's
 * real savings/contribution figures.
 */
export function buildTools(profile) {
  const runWhatIfSimulation = tool(
    async ({ monthlyContribution, years, goalAmount }) => {
      const result = runMonteCarloSimulation({
        currentSavings: profile.currentSavings,
        monthlyContribution: monthlyContribution ?? profile.monthlyContribution,
        years: years ?? profile.years,
        goalAmount: goalAmount ?? profile.goalAmount,
        annualReturnMean: 0.1,
        annualReturnStdDev: 0.15,
        simulations: 2000,
      });
      return JSON.stringify(result);
    },
    {
      name: "runWhatIfSimulation",
      description:
        "Projects the customer's net worth forward under a savings/investing scenario. " +
        "Use this whenever the customer asks a 'what if I save/invest X' question. " +
        "Only pass the fields the customer wants to change from their current plan — omit the rest.",
      schema: z.object({
        monthlyContribution: z.number().optional().describe("Override monthly contribution in rupees"),
        years: z.number().optional().describe("Override projection horizon in years"),
        goalAmount: z.number().optional().describe("Override goal amount in rupees"),
      }),
    }
  );

  const calculateRequiredContribution = tool(
    async ({ goalAmount, years }) => {
      const result = requiredMonthlyContribution({
        currentSavings: profile.currentSavings,
        goalAmount: goalAmount ?? profile.goalAmount,
        years: years ?? profile.years,
        annualReturnMean: 0.1,
      });
      return JSON.stringify({ requiredMonthlyContribution: result });
    },
    {
      name: "calculateRequiredContribution",
      description:
        "Calculates the monthly contribution needed to hit a goal by a target year. " +
        "Use this when the customer asks 'how much do I need to save' rather than 'what if'.",
      schema: z.object({
        goalAmount: z.number().optional().describe("Override goal amount in rupees"),
        years: z.number().optional().describe("Override target horizon in years"),
      }),
    }
  );

  return [runWhatIfSimulation, calculateRequiredContribution];
}
