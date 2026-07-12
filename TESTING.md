# Testing Log

Running record of what's actually implemented and verified, with copy-pasteable curl commands. Update this every time a feature lands — don't just describe it, prove it works.

Assumes the backend is running locally: `cd backend && npm run dev` (default `http://localhost:4000`).

---

## ✅ Health check

`GET /health`

```bash
curl -s http://localhost:4000/health
```

Expected:
```json
{"status":"ok"}
```

---

## ✅ Monte Carlo simulation ("what if" projection)

`POST /api/simulate`

Runs a Monte Carlo projection of net worth over time given a savings/contribution scenario. Returns a year-by-year p10/median/p90 fan chart plus, if `goalAmount` is given, the probability of reaching it.

```bash
curl -s -X POST http://localhost:4000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "currentSavings": 100000,
    "monthlyContribution": 5000,
    "annualReturnMean": 0.10,
    "annualReturnStdDev": 0.15,
    "years": 10,
    "goalAmount": 1500000,
    "simulations": 2000
  }'
```

Expected shape:
```json
{
  "projection": [{ "year": 0, "p10": 100000, "median": 100000, "p90": 100000 }, "..."],
  "finalBalance": { "p10": 807020, "median": 1177601, "p90": 1684597 },
  "probabilityOfReachingGoal": 0.184
}
```

Bad-input check (missing required field should 400, not crash):
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:4000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{"years": -1}'
# → 400
```

---

## ✅ Required monthly contribution (goal back-calculation)

`POST /api/simulate/required-contribution`

Deterministic (not Monte Carlo) — solves for the monthly contribution needed to hit a goal by a target year, given an expected average return.

```bash
curl -s -X POST http://localhost:4000/api/simulate/required-contribution \
  -H "Content-Type: application/json" \
  -d '{
    "currentSavings": 100000,
    "goalAmount": 1500000,
    "years": 10,
    "annualReturnMean": 0.10
  }'
```

Expected:
```json
{ "requiredMonthlyContribution": 6001.10 }
```

Sanity cross-check against `/api/simulate`: contributing *less* than this required amount should produce a `probabilityOfReachingGoal` below 50% — verified true for the ₹5,000/month example above (18.4%).

**Bugs found and fixed during validation** (caught before push, not after):
- `annualReturnMean: 0` caused a division-by-zero → silently returned `null` instead of the correct answer. Fixed: 0%-return case now computed directly (`remaining / n`, no compounding to solve for). Verified: `{"currentSavings":100000,"goalAmount":1500000,"years":10,"annualReturnMean":0}` → `11666.67` (checks out: `(1,500,000 - 100,000) / 120 months`).
- Non-numeric input (e.g. `"currentSavings":"abc"`) silently produced a `200` response full of `null`s (NaN → `null` via `JSON.stringify`) instead of an error. Fixed: both simulation functions now reject non-finite-number inputs with a clear `400`.
- `POST /api/chat` accepted an array as `profile` (`typeof [] === "object"`) and an incomplete profile object, both of which would've reached the agent with `undefined` fields. Fixed: rejects arrays explicitly and validates all four required profile fields are finite numbers before running the agent.

---

## ✅ Goal dashboard (frontend)

Next.js page at `/` — form (current savings, monthly contribution, years, goal amount) → calls `/api/simulate` → renders the fan chart.

```bash
# with both backend (port 4000) and frontend (port 3000) running:
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000
# → 200
curl -s http://localhost:3000 | grep -o "Goal Dashboard"
# → Goal Dashboard
```
(Confirms the page renders server-side; doesn't exercise the client-side fetch/chart — that needs a real browser.)

---

## ✅ Agentic conversation layer

`POST /api/chat` — LangChain.js + Groq agent with tool-calling into `/api/simulate`'s underlying engine.

```bash
curl -s -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "what if I invest 8000 a month instead?",
    "profile": {"currentSavings": 100000, "monthlyContribution": 5000, "years": 10, "goalAmount": 1500000}
  }'
```

**Verified with a real Groq key:**
- Plain conversational message → sensible reply, no tool call forced unnecessarily.
- "What if I invest 8000 a month instead?" → correctly calls `runWhatIfSimulation` with the override and reports a realistic median/range, explained correctly.
- "How much do I actually need to save monthly to hit my goal?" → correctly calls `calculateRequiredContribution`, returning **₹6001.10** — this exactly matches the ground-truth value independently verified against `/api/simulate/required-contribution` directly, confirming the agent is genuinely invoking the tool and relaying its real output, not hallucinating a plausible-sounding number.
- Input validation (`400` for missing `message`, missing/malformed `profile`, array-as-profile, incomplete profile fields) still holds.

**Real bug caught and fixed during this verification pass:** `.env` lives at the repo root, but `dotenv.config()` with no path resolves relative to `process.cwd()` — when run via `cd backend && npm run dev` (as documented in `SETUP.md`), it was looking for `backend/.env`, which doesn't exist. The backend would have silently never seen any of the real keys. Fixed in `backend/src/index.js` by resolving the `.env` path relative to the module's own location instead of the cwd.

Model used: `llama-3.3-70b-versatile` — confirmed working against the real Groq API as of this test.

---

## ✅ Revealed-preference risk/bias model

`POST /api/risk-profile` — Groq structured-output reasoning (not a trained classifier) over a customer's behavioral event history. Accepts either a custom `events` array or a synthetic `preset` for dev/demo: `panic-seller`, `fd-heavy-conservative`, `disciplined-investor`, `scheme-chaser`.

```bash
curl -s -X POST http://localhost:4000/api/risk-profile \
  -H "Content-Type: application/json" \
  -d '{"preset": "panic-seller"}'
```

**Verified against all four presets with a real Groq key:**
- `panic-seller` → `conservative`, flags `loss-aversion` (sold 80% of equity during the drawdown) + `fd-overconcentration` (60% in FDs) — correct.
- `fd-heavy-conservative` → `conservative`, flags `fd-overconcentration` (90% in FDs, correctly identified as genuine FD concentration) — correct.
- `disciplined-investor` → `moderate`, **zero bias flags** — confirms the model doesn't hallucinate problems on clean input, not just that it can find them on bad input.
- `scheme-chaser` → `aggressive`, flags specific to the evidence (impulsive small-cap investment, chasing trends) — see bug note below.

**Real bug caught and fixed during this verification pass:** the first pass on `scheme-chaser` mislabeled a bias as `"fd-overconcentration"` for evidence about small-cap *mutual funds* — there were no FDs anywhere in that scenario. The model was reusing the schema description's example label strings verbatim instead of generating a label that matched the actual evidence. Same pass also produced generic advice-column language ("diversify your portfolio," "avoid impulsive decisions") instead of evidence-grounded coaching, inconsistent with the other three presets' tone. Fixed by rewriting the schema's `type` and `explanation` field descriptions to explicitly forbid reusing example labels/generic advice that don't match the specific evidence, and reinforcing this in the main prompt. Re-tested after the fix: `scheme-chaser` now returns accurate, evidence-specific labels and grounded explanations, and `fd-heavy-conservative` was re-checked to confirm no regression.

Remaining minor observation, not fixed: `fd-heavy-conservative`'s `loss-aversion` label (for *not* selling during a drawdown) is a slightly different behavior pattern than `panic-seller`'s `loss-aversion` label (for actively selling during a drawdown) — both get the same tag despite being close to opposite actions. Defensible either way, but worth tightening further if precise bias taxonomy matters more than it currently does for the demo.

---

## 🚧 Not yet built

- Micro-moment trigger engine (salary/surplus/bonus detection → proactive nudges)
- RM dashboard + suitability/compliance console
- Auth (Clerk), MongoDB Atlas, Turso, Qdrant — none of the data-layer/auth pieces are wired in yet; everything above runs with no persistence and no login
