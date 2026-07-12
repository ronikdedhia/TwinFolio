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
- **Revealed-preference risk model** — not a trained classifier; Groq/LLM structured-output reasoning (via LangChain.js) directly over transaction/portfolio-event history (volatility-period behavior, concentration ratios, scheme-chasing patterns), returning a schema-constrained `{riskTolerance, biasFlags[], reasoning}` object rather than free text — avoids needing fabricated labeled training data, and folds the explainability layer into the same call
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

The official problem statement asks for an app "integrated into the bank's mobile application." Next.js is a web framework, so this is resolved by shipping **one codebase to three surfaces**:

1. **Bank's native mobile app** — the Next.js app embedded via in-app WebView / deep link. This is what satisfies the "integrated into the mobile app" requirement without a separate native rebuild.
2. **Installable responsive PWA** — standalone, add-to-homescreen.
3. **RM/advisor web dashboard** — desktop browser, internal use.

## Data model notes

- **MongoDB Atlas** holds naturally document-shaped, high-write data: conversation logs, nudge history, simulation snapshots.
- **Turso** (libSQL/SQL) holds data that benefits from relational integrity: accounts, goals, audit trail.
- **Qdrant** holds vector embeddings of the customer's own financial context (transaction summaries, goal descriptions, past conversation turns) for the agent's RAG retrieval step. Requires an embedding provider (Voyage AI or OpenAI — chosen to match whichever LLM provider is used, since neither Claude nor Groq serve embeddings directly) to actually generate the vectors before they're stored.

## Why one JS stack

Pieces that originally looked like they needed Python, or a separate ML library, don't:

- **Monte Carlo simulation** — not actually ML, just numerical simulation. Plain JS loops/random sampling handle this natively.
- **Revealed-preference risk/bias model** — no trained classifier at all. Groq (via LangChain.js structured output) reasons directly over behavioral history and returns a schema-constrained result. Trade-off: less deterministic run-to-run than a trained classifier — mitigated with near-zero temperature, a constrained output schema, and full prompt/response audit logging. Worth revisiting only if this becomes a production system needing formally validated/backtested risk scoring.
- **Agentic/RAG orchestration** — LangChain.js (the JS/TS port of LangChain) covers tool-calling agents and RAG retrieval natively.
- **Embeddings** — `@xenova/transformers` runs the embedding model locally in-process, no Python and no external API needed either.

Collapsing to one language removes the cross-service REST call, simplifies deployment to a single target, and matches a 4-person team's ability to context-switch across the whole stack.
