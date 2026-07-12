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
| ML | Plain JS for Monte Carlo simulation; `ml.js` (random forest/logistic regression) for the revealed-preference risk/bias model |
| Data | MongoDB Atlas (conversation logs, nudge history, simulation snapshots) + Turso (SQL: accounts, goals, audit trail) + Qdrant (vector store for RAG embeddings) |
| Infra | Vercel (frontend), Render/Railway (Express service), MongoDB Atlas managed cluster, GitHub Actions (CI/CD) |

## Repo structure

```
twinfolio/
├── README.md
├── ARCHITECTURE.md
├── assets/              # diagrams referenced in the docs
├── apps/
│   └── web/             # Next.js frontend
├── server/               # Express API + ML layer
└── docs/                 # additional design notes
```

*(scaffolding to be filled in as the build progresses)*

## Team

- Team leader: Ronik Dedhia

## Status

Concept/idea-deck stage — prototype build begins if shortlisted (IDBI Innovate 2026 calendar: shortlist announced Aug 1, prototype phase Aug 2–16).
