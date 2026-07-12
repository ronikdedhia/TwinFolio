# Brainstorm — Future Enhancements

Ideas beyond the current 8-week build scope ([FEATURES.md](./FEATURES.md)). Not committed work — a backlog to draw from post-hackathon or if shortlisted for a longer build.

## Avatar & Experience
- Upgrade avatar from 2D (Lottie) to 3D rendering (three.js / Ready Player Me) once the team has dedicated 3D/rigging expertise — deliberately deferred from the current build (see ARCHITECTURE.md's "why not three.js" reasoning)
- Full multi-turn voice conversation (beyond the stretch-goal voice input/output)
- Configurable avatar persona/tone (formal vs. casual) based on customer preference

## Planning Scope Expansion
- Joint/family financial planning — shared goals across household accounts, multiple contributors to one goal
- Retirement drawdown simulation — model the post-retirement spend-down phase, not just the accumulation phase
- Tax planning integration — capital-gains harvesting suggestions, Section 80C optimization
- Insurance gap analysis — life/health coverage adequacy checked against modeled goals
- Debt/credit management — extend the twin to model loan payoff strategies alongside investment goals, not investment-only
- ESG/values-based investing preference filter

## Human-in-the-loop
- Human-advisor escalation blend — route to a human RM automatically when the model's confidence is low or the case is high-net-worth/complex, rather than the AI handling every case
- Advisor-side "explain this recommendation" visual decision-tree view, beyond the current text-based explainability trace

## Reach & Channels
- WhatsApp/SMS nudge delivery channel, beyond in-app only
- Multi-currency / NRI customer support
- Offline-first PWA capabilities for low-connectivity users

## Data & Ecosystem
- Expand beyond Account Aggregator to broader open-banking data sources as they become available
- White-label / API-expose the twin so other banks or wealth platforms could consume it — an ecosystem play similar in spirit to Track 03's ULI/OCEN pitch
- Anomaly/fraud detection layered onto the transaction stream feeding the twin

## Engagement & Growth
- Gamification of financial discipline — streaks, milestones for hitting savings targets
- Peer benchmarking ("how do others in your income bracket invest") — would need careful privacy-preserving framing (cohort aggregates only, no individual exposure)
- Direct in-app execution of recommended investment products, rather than routing every case through RM/product sign-off (would require a deeper suitability-automation conversation with compliance first)
