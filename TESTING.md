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

## 🚧 In progress

- **Agentic conversation layer** (`POST /api/chat`) — LangChain.js + Groq agent, tool-calling into the simulation engine above. Not yet tested — will be added here once verified.
