# Twinfolio

**A financial digital twin — an avatar that simulates your financial future, not a chatbot with a face on top of it.**

Built for **IDBI Innovate 2026**, Track 01 — Wealth Advisory (Wealth Advisory / Conversational AI / Mobile Banking).

## Problem it solves

> Wealth management and advisory services remain fragmented and largely inaccessible to a large number of customers. Absence of comprehensive customer investment behaviour and spending habits limits the ability to provide timely, personalized, data-driven guidance.

Most "avatar-based advisor" products stop at a conversational UI layer bolted onto generic robo-advisor logic — the avatar is decorative. Twinfolio makes the avatar the actual product: a live simulation of the customer's financial future, driven by their real spending, income, and investment behavior.

## What it does

- **Ask "what if"** — "what if I invest ₹5,000/month in an index fund," "what if I cut dining spend 20%" — and the avatar re-renders the projected retirement corpus, home down-payment timeline, or education fund live, in conversation.
- **Revealed-preference risk profiling** — infers real risk tolerance and behavioral biases (panic-selling in downturns, FD-overconcentration, scheme-chasing) from actual transaction/portfolio history, not a static self-reported questionnaire.
- **Bias coaching** — the twin actively coaches against detected biases with counterfactual evidence ("last time markets dropped 8% you moved to cash and missed the recovery — here's what staying invested would have returned").
- **Micro-moment advisory** — proactively surfaces advice at real financial moments (salary credit, surplus cash, a bonus) instead of waiting to be asked, always with an explainable "why now, why this."

## Key features

- Monte Carlo–based financial projection engine with goal modeling (retirement, home purchase, education)
- Revealed-preference risk & bias model trained on transaction/portfolio-event history
- Micro-moment trigger engine (salary/surplus/bonus detection)
- Agentic conversational layer (LangChain.js): retrieves the customer's own data (RAG) and decides which tool to call — simulation engine, risk model, bias engine, trigger engine — rather than just retrieving and generating text
- 2D avatar (Lottie) with expression-reactive responses
- RM dashboard + suitability/compliance console for SEBI investment-adviser norms
- Hindi + regional-language support

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full system design.

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | Next.js (React), Lottie (avatar) |
| Conversational | LLM + RAG + agentic tool-calling (LangChain.js) |
| Backend | Express (Node.js) — single service, app/API + ML + agent orchestration layer |
| ML | Plain JS for Monte Carlo simulation; Groq/LLM structured-output reasoning (via LangChain.js) for the revealed-preference risk/bias model — no trained classifier |
| Data | MongoDB Atlas (conversation logs, nudge history, simulation snapshots) + Turso (SQL: accounts, goals, audit trail) + Qdrant (vector store for RAG embeddings) |
| Infra | Vercel (frontend), Render/Railway (Express service), MongoDB Atlas managed cluster, GitHub Actions (CI/CD) |

## Repo structure

```
twinfolio/
├── README.md, ARCHITECTURE.md, FEATURES.md, BRAINSTORM.md, TEAM.md
├── SETUP.md, TESTING.md, ELI5.md
├── .env.example
├── assets/                          # diagrams referenced in the docs
├── frontend/                        # Next.js app (scaffolded, goal dashboard live)
│   └── src/app/                     # page.tsx (dashboard), icon.svg
└── backend/
    ├── package.json, drizzle.config.js
    ├── drizzle/                     # generated migrations
    └── src/
        ├── env.js                   # dotenv, loaded first — see the file's own comment
        ├── index.js
        ├── routes/                  # simulate.js, chat.js, riskProfile.js
        ├── services/                # simulationEngine.js, syntheticBehavior.js, embeddings.js
        ├── agent/                   # financialTwinAgent.js, tools.js, riskProfileModel.js
        └── db/                      # turso.js, schema.js, mongo.js, qdrant.js, models/
```

## Team

- Team leader: Ronik Dedhia

## Status

Actively building. See [TESTING.md](./TESTING.md) for the full verification log with real API results. Current state:

**✅ Built and verified end-to-end:**
- Monte Carlo simulation + goal back-calculation (`/api/simulate`)
- Goal dashboard (Next.js + Recharts fan chart)
- Agentic chat (`/api/chat`) — LangChain.js + Groq, confirmed genuinely tool-calling (not hallucinating numbers)
- Risk/bias model (`/api/risk-profile`) — Groq structured output, verified across 4 behavioral presets
- Data layer standalone: Turso (profiles schema + migration), MongoDB (conversation/risk-assessment models), Qdrant (collection + real semantic search, cross-user isolation confirmed)

**🚧 In progress:** wiring auth (Clerk) + the data layer into the actual routes — right now `/api/chat` and `/api/risk-profile` are still stateless (no login, nothing persists, no real RAG retrieval happening in a live conversation yet, even though Qdrant search works standalone).

**⬜ Not started:** micro-moment trigger engine, RM dashboard, polish/demo prep.

IDBI Innovate 2026 calendar for reference: shortlist announced Aug 1, prototype-evaluation phase Aug 2–16.
