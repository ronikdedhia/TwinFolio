# Team — Strengths & Work Distribution

## Team

| Member | Level | Core strength |
|---|---|---|
| Yuvraj | Senior | Microservices, Express backend, system design |
| Harish | Senior | LLM/AI, RAG, conversational AI |
| Aniket | Junior | Backend, auth |
| Ronik | All-rounder | No fixed lane — fills whichever gap is open (frontend, product, backend, PM) |

## Role mapping

- **Yuvraj — Backend/Platform lead.** Owns overall system design, the Express service architecture, the MongoDB Atlas + Turso + Qdrant data-layer split, the simulation-engine service, deployment/infra, and CI/CD. System-design ownership sits with Yuvraj alone (not split with Harish) since Harish's specialty is AI, not backend architecture — avoids overlap.
- **Harish — AI/Conversational lead.** Owns the agentic conversation layer (LangChain.js) — the RAG retrieval setup over Qdrant, the tool-calling logic wiring the agent into the simulation/risk/bias engines, LLM integration and prompt design, the revealed-preference risk/bias model (Groq/LLM structured-output reasoning, not a trained classifier), and the micro-moment trigger logic.
- **Aniket — Backend/Auth support.** Owns SSO/MFA, the Account Aggregator consent lifecycle, audit-trail logging, and suitability/compliance data plumbing. Works under Yuvraj's system design rather than owning architecture decisions solo, given the seniority gap — pairs with Yuvraj on anything system-design-heavy.
- **Ronik — Frontend/Product/All-rounder.** Owns the Next.js app, Lottie avatar integration, goal dashboard + scenario sandbox UI, RM dashboard UI, demo narrative, and the pitch deck. Floats to unblock whichever lane is behind, since there's no dedicated frontend specialist besides Ronik — this is the team's tightest bandwidth constraint (see Risks below).

## Sprint-by-sprint distribution (4 sprints × 2 weeks = 8 weeks)

### Sprint 1 (Wk 1–2) — Foundational scaffolding
| Member | Focus |
|---|---|
| Yuvraj | Express service scaffold, system design doc, data model (Mongo + SQL schemas), repo/CI setup |
| Harish | LLM provider integration spike, RAG grounding design, revealed-preference model research/data schema |
| Aniket | Auth scaffolding (SSO/MFA), AA consent-flow skeleton, basic backend routes/tests |
| Ronik | Next.js app scaffold, synthetic dataset generation, avatar tech-spike (Lottie), low-fi UI wireframes |

### Sprint 2 (Wk 3–4) — Core logic v1
| Member | Focus |
|---|---|
| Yuvraj | Monte Carlo simulation engine (plain JS) wired into Express, API contracts for frontend |
| Harish | Revealed-preference risk model v1 (Groq/LLM structured-output reasoning) on synthetic data, agentic conversation layer v1 |
| Aniket | Consent management service completed, audit logging v1, backend test coverage |
| Ronik | Goal dashboard + scenario sandbox UI, avatar conversation UI wired to backend |

### Sprint 3 (Wk 5–6) — Real data + integration
| Member | Focus |
|---|---|
| Yuvraj | Real sandbox data integration (post Aug 4 access), performance tuning, infra hardening (Render/Vercel deploy) |
| Harish | Bias-coaching engine, micro-moment trigger engine tuned on real data, conversation-quality tuning |
| Aniket | Suitability/compliance console backend, RM dashboard APIs, security-review support |
| Ronik | RM dashboard UI, nudge inbox UI, cross-feature integration testing, demo-script drafting |

### Sprint 4 (Wk 7–8) — Polish & demo readiness
| Member | Focus |
|---|---|
| Yuvraj | Load testing, deployment pipeline finalization, system design doc finalized for submission |
| Harish | Conversation-quality test suite, model backtest/benchmarking report, explainability polish |
| Aniket | Bug fixes, auth/security hardening, regression testing |
| Ronik | Voice interface (stretch, if time permits), analytics dashboard, full demo rehearsal, pitch deck + video |

## Progress vs. plan

What's actually built so far spans across the planned sprints, not cleanly within one — see [TESTING.md](./TESTING.md) for verification detail:

- **Sprint 1 scope** (scaffolding, data model) — done: Express + Next.js scaffolds, Turso/Mongo/Qdrant schemas and clients all exist and are verified against the real services.
- **Sprint 2 scope** (core logic v1) — done: simulation engine wired into Express, goal dashboard UI, agentic conversation layer v1, risk model v1 — all verified with real API calls, not just written.
- **Sprint 3 scope** (real data + integration) — partially done: the risk model already runs (Sprint 3 called for "tuned on real data," but there's no real sandbox data yet, so it currently runs on synthetic presets instead). Not yet done: RM dashboard, wiring auth/persistence into the live routes, micro-moment trigger engine.

Net effect: simulation + chat + risk-model logic is ahead of the original sprint boundary, while persistence/auth wiring and the RM dashboard are behind it. Whoever picks up Yuvraj's or Aniket's lane next should start with wiring Clerk + the already-built DB clients into the existing routes, not with Sprint 1-style scaffolding — that part's done.

## Risks in this composition

- **No dedicated frontend/avatar specialist besides Ronik.** Frontend is the tightest bandwidth constraint on the team. If Ronik gets pulled into demo/pitch-deck work late in the timeline, frontend polish is what slips first — plan buffer time in Sprint 4 accordingly, and let Aniket absorb simple UI tasks if backend/auth work finishes ahead of schedule.
- **Two "senior" members, one lane each.** Yuvraj and Harish are both senior, but their specialties don't overlap (backend/system-design vs. AI/LLM) — deliberately kept as two separate lanes rather than pairing them, to avoid duplicated ownership.
- **Aniket is junior.** Scoped to well-bounded backend/auth tasks with clear specs from Yuvraj, rather than open-ended architecture ownership.
