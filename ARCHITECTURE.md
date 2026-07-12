# Architecture

## Overview

Twinfolio is a single Next.js + Express application (no separate ML microservice — see [Why one JS stack](#why-one-js-stack) below) built around four layers: **Sources → Ingestion → Core → Interface**, with cross-cutting auth, compliance, audit, and observability concerns applied throughout.

![Architecture diagram](./assets/architecture.png)

### Sources
- Bank mobile-app data (transactions, existing holdings — MF, FD, insurance)
- Account Aggregator (consent-based pull of externally-held investments)
- Market data feed (NAV / index levels / FD rate cards)

### Ingestion
- Data connectors for each source above
- AA consent management (request → approve → fetch → revoke lifecycle)
- Event stream detecting salary credits, large transactions, and surplus cash — feeds the micro-moment trigger engine

### Core
- **Monte Carlo simulation engine** — plain JS, no library needed; forward-projects net worth under different contribution/spending scenarios
- **Revealed-preference risk model** — `ml.js` random forest/logistic regression trained on transaction/portfolio-event history (volatility-period behavior, concentration ratios, scheme-chasing patterns)
- **Bias-coaching rules engine** — maps detected bias patterns to coaching scripts and counterfactual return calculations
- **Agentic conversation layer (LangChain.js)** — not a plain RAG chatbot. The avatar is a tool-calling agent that retrieves the customer's own context (RAG over Qdrant embeddings) and decides which tool to invoke based on the question:
  - `runSimulation()` → Monte Carlo engine
  - `getRiskProfile()` → revealed-preference risk model
  - `getBiasFlags()` → bias-coaching engine
  - `checkMicroMoment()` → trigger engine status
  - `escalateToRM()` → human-in-the-loop handoff
  It then synthesizes the tool output into an explainable, natural-language avatar response.

### Interface
- Avatar (2D, Lottie — voice/text reactive)
- Customer app (goals, scenario sandbox, nudge inbox)
- RM dashboard + suitability/compliance console

### Cross-cutting
SSO/MFA auth · SEBI-suitability compliance checks · immutable audit trail (every recommendation logged with model version) · observability (simulation latency, conversation fallback rate, market-data freshness)

## Process flow

![Process flow diagram](./assets/process-flow.png)

A micro-moment trigger (salary/surplus/bonus) or a direct customer question both enter through the avatar conversation layer, which calls the simulation engine and the revealed-preference risk model, passes through the bias-coaching engine, and returns an explainable response with a live-re-rendered projection. If the customer accepts a nudge, it's routed to product/RM suitability sign-off; otherwise it's logged to the coaching feed for later.

## Mobile integration strategy

![Mobile integration diagram](./assets/mobile-integration.png)

The official problem statement asks for an app "integrated into the bank's mobile application." Next.js is a web framework, so this is resolved by shipping **one codebase to three surfaces**:

1. **Bank's native mobile app** — the Next.js app embedded via in-app WebView / deep link. This is what satisfies the "integrated into the mobile app" requirement without a separate native rebuild.
2. **Installable responsive PWA** — standalone, add-to-homescreen.
3. **RM/advisor web dashboard** — desktop browser, internal use.

## Data model notes

- **MongoDB Atlas** holds naturally document-shaped, high-write data: conversation logs, nudge history, simulation snapshots.
- **Turso** (libSQL/SQL) holds data that benefits from relational integrity: accounts, goals, audit trail.
- **Qdrant** holds vector embeddings of the customer's own financial context (transaction summaries, goal descriptions, past conversation turns) for the agent's RAG retrieval step. Requires an embedding provider (Voyage AI or OpenAI — chosen to match whichever LLM provider is used, since neither Claude nor Groq serve embeddings directly) to actually generate the vectors before they're stored.

## Why one JS stack

Three pieces originally looked like they needed Python:

- **Monte Carlo simulation** — not actually ML, just numerical simulation. Plain JS loops/random sampling handle this natively.
- **Revealed-preference risk/bias model** — genuine ML, but at hackathon/demo scale, `ml.js` (random forest, logistic regression) is sufficient. Trade-off: less mature tooling than scikit-learn/XGBoost (no SHAP-equivalent explainability library, smaller community) — acceptable for a prototype proving the concept, worth revisiting if this becomes a production system on real bank-scale data.
- **Agentic/RAG orchestration** — LangChain.js (the JS/TS port of LangChain) covers tool-calling agents and RAG retrieval natively, so this doesn't need Python either.

Collapsing to one language removes the cross-service REST call, simplifies deployment to a single target, and matches a 4-person team's ability to context-switch across the whole stack.
