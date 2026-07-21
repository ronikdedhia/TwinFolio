# Twinfolio

**A financial digital twin — an avatar that simulates your financial future, not a chatbot with a face on top of it.**

🔴 **[Live demo](https://twin-folio.vercel.app/)**

A wealth-advisory / conversational-AI / customer-facing fintech project — built to be demoed live, not just pitched as a slide.

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
- Rule-based nudge engine — checks the customer's own numbers (surplus vs. required contribution, off-track probability) and surfaces it unprompted on the dashboard; not yet a push/event-triggered "salary just landed" system
- Agentic conversational layer (LangChain.js): retrieves the customer's own data (RAG) and decides which tool to call — simulation engine, risk model, bias engine — rather than just retrieving and generating text
- Customer login (Clerk) — profile, chat, risk profile, and nudges are all tied to the real signed-in user, not stateless demo calls
- RM/staff dashboard — every customer's plan, latest risk read, and latest nudge in one table, gated by an admin allowlist
- 2D avatar (Lottie) — dependency installed, no animation asset wired in yet
- Hindi + regional-language support — not started
- Suitability/compliance console for SEBI investment-adviser norms — not started

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
├── frontend/                        # Next.js app — dashboard, chat, staff view all live
│   └── src/
│       ├── app/                     # page.tsx (dashboard), staff/page.tsx, layout.tsx (ClerkProvider)
│       ├── components/              # Nav.tsx, Chat.tsx, Nudges.tsx
│       └── lib/                     # api.ts (authenticated fetch helper)
└── backend/
    ├── package.json, drizzle.config.js
    ├── drizzle/                     # generated migrations
    └── src/
        ├── env.js                   # dotenv, loaded first — see the file's own comment
        ├── index.js
        ├── middleware/              # auth.js (Clerk requireUser / requireAdmin)
        ├── routes/                  # simulate.js, chat.js, riskProfile.js, profile.js, nudges.js, admin.js
        ├── services/                # simulationEngine.js, syntheticBehavior.js, chatService.js, nudgeService.js
        ├── agent/                   # financialTwinAgent.js, tools.js, riskProfileModel.js
        └── db/                      # turso.js, schema.js, mongo.js, qdrant.js, models/ (incl. Nudge.js)
```

## Team

- Team leader: Ronik Dedhia

## Status

Actively building. See [TESTING.md](./TESTING.md) for the full verification log with real API results. Current state:

**✅ Built and verified end-to-end:**
- Monte Carlo simulation + goal back-calculation (`/api/simulate`)
- Login (Clerk) wired end-to-end — frontend sign-in, backend `requireUser`/`requireAdmin` gating on every customer-scoped route
- Profile persistence (`/api/profile`) — dashboard, chat, and nudges all read/write the same stored customer profile
- Goal dashboard (Next.js + Recharts fan chart), redesigned with a card layout, shared nav, and a sticky chat sidebar
- Agentic chat (`/api/chat`) — LangChain.js + Groq, confirmed genuinely tool-calling (not hallucinating numbers), now with a real chat UI (message bubbles, auto-scroll)
- Risk/bias model (`/api/risk-profile`) — Groq structured output, verified across 4 behavioral presets
- Nudge engine (`/api/nudges`) — rule-based, checks the customer's own numbers (surplus vs. required contribution, off-track probability, no contribution set) and surfaces it on the dashboard unprompted; logic hand-verified against real numbers
- Staff/RM dashboard (`/api/admin/customers`, `/staff`) — every customer's plan, latest risk read, and latest nudge in one table, gated by an `ADMIN_USER_IDS` allowlist
- Data layer: Turso (profiles schema + migration), MongoDB (conversation/risk-assessment/nudge models), Qdrant (collection + real semantic search, cross-user isolation confirmed)

**🚧 Not yet exercised live (code-correct, unverified in a real browser):** the actual Clerk sign-in click-through, a live chat round-trip through Groq, and the Qdrant/Mongo pipeline under a real authenticated session — build/typecheck/lint all pass, but a real end-to-end smoke test hasn't been run yet.

**⬜ Not started:** event-driven micro-moment triggers (nudges are currently checked when the dashboard loads, not pushed on a real salary-credit/bonus event), 2D Lottie avatar (dependency installed, no animation asset), Hindi/regional-language support, SEBI suitability/compliance console, automated test suite.
