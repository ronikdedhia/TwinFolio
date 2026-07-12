// Plain-JS Monte Carlo projection engine — no ML library needed, just math.

function sampleNormal(mean, stdDev) {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z0 * stdDev;
}

function percentile(sortedArr, p) {
  const idx = Math.floor(p * (sortedArr.length - 1));
  return sortedArr[idx];
}

/**
 * Projects a customer's net worth forward under random return paths.
 * Returns a year-by-year p10/median/p90 "fan chart" and, if a goalAmount
 * is given, the probability of reaching it.
 */
export function runMonteCarloSimulation({
  currentSavings = 0,
  monthlyContribution = 0,
  annualReturnMean = 0.1,
  annualReturnStdDev = 0.15,
  years = 10,
  goalAmount = null,
  simulations = 2000,
} = {}) {
  if (years < 1) throw new Error("years must be at least 1");
  if (simulations < 1) throw new Error("simulations must be at least 1");

  const allPaths = [];

  for (let s = 0; s < simulations; s++) {
    let balance = currentSavings;
    const path = [balance];
    for (let y = 1; y <= years; y++) {
      const r = sampleNormal(annualReturnMean, annualReturnStdDev);
      balance = Math.max(balance * (1 + r) + monthlyContribution * 12, 0);
      path.push(balance);
    }
    allPaths.push(path);
  }

  const projection = [];
  for (let y = 0; y <= years; y++) {
    const valuesAtYear = allPaths.map((p) => p[y]).sort((a, b) => a - b);
    projection.push({
      year: y,
      p10: percentile(valuesAtYear, 0.1),
      median: percentile(valuesAtYear, 0.5),
      p90: percentile(valuesAtYear, 0.9),
    });
  }

  const finalBalances = allPaths.map((p) => p[p.length - 1]).sort((a, b) => a - b);

  const result = {
    projection,
    finalBalance: {
      p10: percentile(finalBalances, 0.1),
      median: percentile(finalBalances, 0.5),
      p90: percentile(finalBalances, 0.9),
    },
  };

  if (goalAmount != null) {
    const successCount = finalBalances.filter((b) => b >= goalAmount).length;
    result.probabilityOfReachingGoal = successCount / simulations;
  }

  return result;
}

/**
 * Deterministic back-calculation: how much does the customer need to
 * contribute monthly to hit a goal by a target year, given an expected
 * average return (not a Monte Carlo distribution — this is the "what
 * contribution do I need" question, not the "what might happen" question).
 */
export function requiredMonthlyContribution({
  currentSavings = 0,
  goalAmount,
  years,
  annualReturnMean = 0.1,
} = {}) {
  if (!goalAmount || goalAmount <= 0) throw new Error("goalAmount must be a positive number");
  if (!years || years < 1) throw new Error("years must be at least 1");

  const n = years * 12;
  const monthlyRate = annualReturnMean / 12;
  const fvOfCurrentSavings = currentSavings * Math.pow(1 + monthlyRate, n);
  const remaining = goalAmount - fvOfCurrentSavings;

  if (remaining <= 0) return 0;

  const annuityFactor = (Math.pow(1 + monthlyRate, n) - 1) / monthlyRate;
  return remaining / annuityFactor;
}
