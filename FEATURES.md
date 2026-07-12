# Features — Current Scope

Everything below is in scope for the 4-person / 8-week build (IDBI Innovate 2026, Track 01). Ideas beyond this scope live in [BRAINSTORM.md](./BRAINSTORM.md).

## 1. Data & Ingestion
- Bank mobile-app data connectors: transaction history, existing holdings (MF, FD, insurance), goal-tracking data
- Consent-based Account Aggregator pull for externally-held investments
- Live market-data feed integration (NAVs, index levels, FD rate cards)
- Synthetic behavioral dataset for dev/demo, with embedded bias patterns (panic-selling events, FD-overconcentration, herd-following purchases) so the risk model has realistic signal before real sandbox access (Aug 4)
- Event stream for salary-credit, large-transaction, and surplus-cash detection
- Embedding pipeline: chunk + embed customer context (transaction summaries, goal descriptions, past conversation turns) into Qdrant for the agent's RAG retrieval step

## 2. Simulation & Modeling Engine
- Monte Carlo–based financial projection engine (plain JS), parameterized per customer
- Goal modeling module (retirement, home purchase, education) with required-contribution back-calculation
- Revealed-preference risk & bias model (`ml.js`) trained on transaction/portfolio-event history
- Bias-coaching rules engine mapping detected patterns to coaching scripts and counterfactual return calculations
- Micro-moment trigger engine (rule + ML hybrid) generating prioritized nudge candidates
- Agentic conversation layer (LangChain.js) with tool-calling into the simulation engine, risk model, bias engine, and micro-moment engine — not just RAG retrieval+generation
- Explainability layer tracing every recommendation back to its driving data points

## 3. Avatar / Conversational Interface
- 2D avatar rendering (Lottie) with expression-reactive responses synced to conversation state
- LLM-backed agent (LangChain.js), grounded via RAG (Qdrant vector search) on the customer's own financial data, with tool-calling to invoke the simulation/risk/bias engines on demand
- Live re-simulation UI: projection chart re-renders in real time as the conversation progresses
- Hindi + regional-language support

## 4. Customer-Facing App
- Goal dashboard: active goals, trajectory-vs-target tracking, one-tap "talk to your twin"
- Scenario sandbox: save and compare multiple "what if" projections side by side
- Bias & coaching feed with outcome tracking (did the customer act on the nudge?)
- Nudge inbox (accept / dismiss / snooze), linking directly into the relevant investment product
- Consolidated portfolio-health view across bank-held and AA-aggregated holdings

## 5. Advisor/Bank-Facing App
- RM dashboard surfacing customers with high-value nudges or significant bias flags for human follow-up
- Suitability/compliance console logging every AI recommendation with its explainability trace (SEBI investment-adviser suitability norms)
- Product configuration UI for eligibility/suitability rules — no engineering changes required
- Analytics dashboard: nudge-acceptance rates, AUM growth attribution, cohort engagement metrics

## 6. Platform / Cross-Cutting
- SSO integration with the bank's existing mobile-app auth; MFA on high-value confirmations
- Regulatory compliance layer: SEBI suitability checks, mandatory disclosures at the right conversation points
- Immutable audit trail tied to model version per recommendation
- Observability: simulation latency, conversation-quality/fallback rate, market-data freshness SLAs
- Encryption of portfolio/PII data, tokenized identifiers, AA-consent lifecycle management
- CI/CD with projection-engine regression tests and conversation-layer prompt regression tests

## 7. Mobile Integration
- Single Next.js codebase shipped to three surfaces: bank's native mobile app (via in-app WebView / deep link), installable responsive PWA, and RM/advisor web dashboard — see [ARCHITECTURE.md](./ARCHITECTURE.md#mobile-integration-strategy)

## Stretch (build only if time permits within the 8 weeks)
- Voice interface (voice input/output for the avatar conversation)
