// Synthetic behavioral event presets for dev/demo — stands in for real
// GST/UPI/AA transaction & portfolio history until real sandbox data is
// available. Each preset is designed to trigger a specific, recognizable
// bias pattern so the risk model's output is checkable against intent.

const PRESETS = {
  "panic-seller": [
    { date: "2025-03-01", type: "market_drawdown", description: "Nifty fell 12% over 2 weeks" },
    { date: "2025-03-12", type: "portfolio_action", description: "Sold 80% of equity mutual fund holdings during the drawdown" },
    { date: "2025-09-01", type: "portfolio_action", description: "Did not re-enter equity markets for 6 months after selling" },
    { date: "2025-01-05", type: "holding_snapshot", description: "Current allocation: 15% equity, 25% cash, 60% fixed deposits" },
  ],
  "fd-heavy-conservative": [
    { date: "2025-01-05", type: "holding_snapshot", description: "Current allocation: 5% equity, 5% cash, 90% fixed deposits" },
    { date: "2024-06-01", type: "portfolio_action", description: "Renewed all maturing FDs into new FDs, no new equity investment in 3 years" },
    { date: "2024-11-10", type: "market_drawdown", description: "Nifty fell 8% over 1 month" },
    { date: "2024-11-15", type: "portfolio_action", description: "No action taken during the drawdown — held existing FDs as usual" },
  ],
  "disciplined-investor": [
    { date: "2025-01-05", type: "holding_snapshot", description: "Current allocation: 55% equity, 10% cash, 35% fixed deposits" },
    { date: "2025-03-01", type: "market_drawdown", description: "Nifty fell 12% over 2 weeks" },
    { date: "2025-03-15", type: "portfolio_action", description: "Continued monthly SIP contribution unchanged during the drawdown" },
    { date: "2025-04-01", type: "portfolio_action", description: "Made an additional lump-sum equity investment shortly after the drawdown" },
  ],
  "scheme-chaser": [
    { date: "2024-08-01", type: "portfolio_action", description: "Invested a lump sum in a small-cap fund after seeing it mentioned in a WhatsApp forward" },
    { date: "2024-08-20", type: "portfolio_action", description: "Redeemed the small-cap fund at a loss after 3 weeks, citing 'it wasn't going up fast enough'" },
    { date: "2024-09-05", type: "portfolio_action", description: "Invested in a different trending small-cap fund based on a social media recommendation" },
    { date: "2025-01-05", type: "holding_snapshot", description: "Current allocation: 40% in 3 different small-cap funds bought within the last 6 months, 60% cash" },
  ],
};

export function getSyntheticBehaviorEvents(presetName) {
  const preset = PRESETS[presetName];
  if (!preset) {
    throw new Error(
      `Unknown preset: ${presetName}. Available presets: ${Object.keys(PRESETS).join(", ")}`
    );
  }
  return preset;
}

export function listPresetNames() {
  return Object.keys(PRESETS);
}
