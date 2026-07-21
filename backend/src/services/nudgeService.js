import { runMonteCarloSimulation, requiredMonthlyContribution } from "./simulationEngine.js";

function formatRupees(value) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

/**
 * The twin "noticing things on its own" — no chat prompt needed. Deterministic,
 * rule-based checks against the customer's stored profile, each one explaining
 * itself with the customer's own numbers (never "trust me").
 *
 * Returns at most 2 nudges, most decision-relevant first, so the customer
 * isn't spammed every time they open the dashboard.
 */
export function generateNudges(profile) {
  const { currentSavings, monthlyContribution, years, goalAmount } = profile;
  const nudges = [];

  if (monthlyContribution === 0) {
    nudges.push({
      type: "no_contribution_set",
      message:
        "You haven't set a monthly contribution yet — even a small regular amount adds up over " +
        `${years} years. Try a what-if with ₹500/month and see the difference.`,
      basis: `monthlyContribution=0, years=${years}`,
    });
  }

  if (goalAmount > 0 && years > 0) {
    const required = requiredMonthlyContribution({ currentSavings, goalAmount, years });
    const surplus = monthlyContribution - required;

    if (required <= 0) {
      nudges.push({
        type: "goal_already_reachable",
        message:
          `Your current savings of ${formatRupees(currentSavings)} alone are on track to reach ` +
          `your ${formatRupees(goalAmount)} goal in ${years} years — you don't need to add more.`,
        basis: `currentSavings=${currentSavings}, goalAmount=${goalAmount}, years=${years}, requiredMonthlyContribution<=0`,
      });
    } else if (required > 0 && Math.abs(surplus) / required > 0.15) {
      if (surplus > 0) {
        nudges.push({
          type: "surplus_detected",
          message:
            `You're contributing ${formatRupees(monthlyContribution)}/month but only need ` +
            `${formatRupees(required)}/month to hit your ${formatRupees(goalAmount)} goal in ${years} years — ` +
            `that's ${formatRupees(surplus)}/month spare you could put toward another goal, or hit this one early.`,
          basis: `monthlyContribution=${monthlyContribution}, requiredMonthlyContribution=${required.toFixed(2)}`,
        });
      } else {
        nudges.push({
          type: "off_track_for_goal",
          message:
            `At ${formatRupees(monthlyContribution)}/month you're ${formatRupees(-surplus)}/month short of the ` +
            `${formatRupees(required)}/month needed to reach your ${formatRupees(goalAmount)} goal in ${years} years.`,
          basis: `monthlyContribution=${monthlyContribution}, requiredMonthlyContribution=${required.toFixed(2)}`,
        });
      }
    }

    const simResult = runMonteCarloSimulation({
      currentSavings,
      monthlyContribution,
      years,
      goalAmount,
      annualReturnMean: 0.1,
      annualReturnStdDev: 0.15,
      simulations: 2000,
    });
    const probability = simResult.probabilityOfReachingGoal ?? 0;
    if (probability < 0.4) {
      nudges.push({
        type: "low_probability_warning",
        message:
          `Markets are unpredictable — at this pace there's only about a ${Math.round(probability * 100)}% ` +
          `chance you actually reach your goal, even though the average case looks fine. Want to see what a ` +
          `bigger monthly contribution would do?`,
        basis: `probabilityOfReachingGoal=${probability.toFixed(3)}, simulations=2000`,
      });
    }
  }

  return nudges.slice(0, 2);
}
