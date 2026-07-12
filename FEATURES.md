# Features — Current Scope

Everything below is in scope for the 4-person / 8-week build (IDBI Innovate 2026, Track 01). Ideas beyond this scope live in [BRAINSTORM.md](./BRAINSTORM.md).

Status key: ✅ built & verified with real data · ⚠️ built, verified standalone but not wired into the live app · 🚧 not started.

## 1. Data & Ingestion
- 🚧 Bank mobile-app data connectors: transaction history, existing holdings (MF, FD, insurance), goal-tracking data
- 🚧 Consent-based Account Aggregator pull for externally-held investments
- 🚧 Live market-data feed integration (NAVs, index levels, FD rate cards)
- ✅ Synthetic behavioral dataset for dev/demo (4 presets: panic-seller, fd-heavy-conservative, disciplined-investor, scheme-chaser) — real sandbox data not available yet
- 🚧 Event stream for salary-credit, large-transaction, and surplus-cash detection
- ⚠️ Embedding pipeline: chunk + embed customer context into Qdrant — the pipeline itself works (local, via `@xenova/transformers`) and real semantic search is verified, but nothing calls it from a live conversation yet

## 2. Simulation & Modeling Engine
- ✅ Monte Carlo–based financial projection engine (plain JS), parameterized per customer — `/api/simulate`
- ✅ Goal modeling module with required-contribution back-calculation — `/api/simulate/required-contribution`
- ✅ Revealed-preference risk & bias model — Groq/LLM structured-output reasoning (LangChain.js), not a trained classifier — `/api/risk-profile`
- ✅ Bias-coaching (folded into the risk model's `explanation` field rather than a separate engine)
- 🚧 Micro-moment trigger engine (rule + ML hybrid) generating prioritized nudge candidates
- ✅ Agentic conversation layer (LangChain.js) with tool-calling into the simulation engine — `/api/chat`, verified genuinely invoking tools rather than hallucinating numbers
- ✅ Explainability — every risk/bias flag ships with `evidence` + `explanation` tracing back to the specific input event

## 3. Avatar / Conversational Interface
- 🚧 2D avatar rendering (Lottie) — package installed in `frontend/`, no avatar UI built yet
- ✅ LLM-backed agent (LangChain.js) — live and verified; ⚠️ RAG grounding (Qdrant vector search) works standalone but isn't connected to the agent yet, so it currently has no memory of past conversations
- 🚧 Live re-simulation UI tied to the conversation (the goal dashboard's chart is driven by the form, not by chat yet)
- 🚧 Hindi + regional-language support

## 4. Customer-Facing App
- ✅ Goal dashboard: form → simulation → fan chart (Next.js + Recharts)
- 🚧 Scenario sandbox: save and compare multiple "what if" projections side by side
- 🚧 Bias & coaching feed with outcome tracking
- 🚧 Nudge inbox
- 🚧 Consolidated portfolio-health view across bank-held and AA-aggregated holdings

## 5. Advisor/Bank-Facing App
- 🚧 RM dashboard surfacing customers with high-value nudges or significant bias flags
- 🚧 Suitability/compliance console
- 🚧 Product configuration UI
- 🚧 Analytics dashboard

## 6. Platform / Cross-Cutting
- 🚧 Auth (Clerk) — installed, not yet wired into any route; every endpoint is currently unauthenticated
- 🚧 Regulatory compliance layer (SEBI suitability checks, disclosures)
- ⚠️ Audit trail — MongoDB model exists (`RiskAssessment`) but isn't called from the risk-profile route yet, so nothing is actually logged
- 🚧 Observability (latency/fallback-rate/freshness monitoring)
- 🚧 Encryption/tokenization of PII, AA-consent lifecycle
- 🚧 CI/CD — no test suite or pipeline yet, verification so far has been manual (see TESTING.md)

## 7. Mobile Integration
- 🚧 Single Next.js codebase shipped to three surfaces (native app WebView, PWA, RM dashboard) — architecturally decided, not yet built since there's no native app shell to embed into

## Stretch (build only if time permits within the 8 weeks)
- Voice interface (voice input/output for the avatar conversation)
