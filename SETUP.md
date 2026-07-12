# Setup

Stack locked in: **Groq** (LLM), **local free embeddings** via `@xenova/transformers` (no API key, runs in-process — genuinely free, no rate limits, no signup), **Clerk** (auth), MongoDB Atlas + Turso + Qdrant (data layer), Next.js + Express (app).

**Status: steps 1–9 below are done** — all real accounts provisioned, `.env` populated, frontend scaffolded, backend deps installed, Turso migration pushed, and all three databases verified against the real cloud services (see [TESTING.md](./TESTING.md)). What's actually left is step 10 — Clerk middleware isn't wired in yet, and the routes don't use the DB clients yet even though the clients themselves work. This doc is kept as the setup reference for anyone new joining the repo, not just a forward-looking plan.

## 0. Prerequisites
- Node.js 20+
- A [Clerk](https://clerk.com) account (free tier) — create an application, grab the publishable + secret keys
- A [Groq](https://console.groq.com) account (free tier) — grab an API key
- A [Turso](https://turso.tech) account + the Turso CLI, or just the web console
- A MongoDB Atlas cluster (free M0 tier)
- Docker, if running Qdrant locally (recommended for dev — free, no signup)

## 1. Push the repo to GitHub
```bash
cd twinfolio
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

## 2. Frontend — Next.js
```bash
npx create-next-app@latest frontend --typescript --tailwind --eslint
cd frontend
npm install @clerk/nextjs lottie-react
cd ..
```

## 3. Backend — Express
```bash
cd backend
npm init -y
npm install express cors helmet dotenv
npm install @clerk/express
npm install langchain @langchain/core @langchain/groq
npm install @qdrant/js-client-rest
npm install @xenova/transformers
npm install @libsql/client drizzle-orm
npm install mongoose
npm install -D drizzle-kit nodemon
cd ..
```
Or just use the [`backend/package.json`](./backend/package.json) already written and run `npm install` inside `backend/`.

## 4. Environment variables
```bash
cp .env.example .env
# then fill in the real keys (Clerk, Groq, Turso, Qdrant, MongoDB)
```
See [`.env.example`](./.env.example) for the full list — nothing is needed for embeddings since that model runs locally.

## 5. MongoDB Atlas
Create a dedicated project + M0 cluster + scoped database user (see the earlier conversation for the full walkthrough: dedicated Atlas project, `readWrite` scoped to just the `twinfolio` database, not a broad built-in role). Two real gotchas hit and fixed while setting this up — both silent, not obvious from the error alone:
- If the generated password contains a reserved URI character (`@`, `:`, `/`, `%`, `#`, etc.), it must be percent-encoded in the connection string — an unencoded `%` in particular produces a confusing `URI malformed` parse error rather than an obviously-about-encoding one.
- The connection string Atlas gives you defaults to no database name (`.../?retryWrites=...`), which silently connects to a database literally named `test` instead of `twinfolio` — add `/twinfolio` right after the host, before the `?`. Symptom if you miss this: a permissions error mentioning `test.<collection>` even though your user was scoped correctly to `twinfolio`.

## 6. Qdrant
```bash
docker run -p 6333:6333 qdrant/qdrant
```
In practice we used an existing Qdrant Cloud cluster with a dedicated collection (`twinfolio_conversations`) rather than local Docker — same client either way, just point `QDRANT_URL`/`QDRANT_API_KEY` at whichever you use. Two real gotchas hit and fixed during setup, worth knowing if you hit them too:
- `QDRANT_URL` must be the actual HTTPS cluster URL from the Qdrant Cloud dashboard, not the `localhost:6333` default in `.env.example` — using the default with a real cloud API key produces a confusing `ECONNREFUSED` rather than an obvious "wrong URL" error.
- Qdrant Cloud requires an explicit payload index before you can filter-search by a field (e.g. `userId`) — `backend/src/db/qdrant.js`'s `ensureCollectionExists()` creates this automatically now, but only on first collection creation.

## 7. Turso — create the database
```bash
turso db create twinfolio-db
turso db show twinfolio-db --url          # → TURSO_DATABASE_URL
turso db tokens create twinfolio-db       # → TURSO_AUTH_TOKEN
```

## 8. Drizzle — schema & migrations (Turso)
```bash
cd backend
npx drizzle-kit generate
npx drizzle-kit push
cd ..
```

## 9. Run it
```bash
# terminal 1
cd frontend && npm run dev

# terminal 2
cd backend && npm run dev
```

## 10. What's actually left (as of this writing)
- **Clerk middleware** in Express (`@clerk/express`) to protect API routes, and `<ClerkProvider>` + sign-in UI in the Next.js app — not started.
- **Wire the already-built, already-verified DB clients into the live routes**: `/api/chat` and `/api/risk-profile` currently take a manually-passed `profile`/`preset` in the request body and persist nothing. They should instead read/write via `backend/src/db/turso.js` (profile), log to MongoDB (`ConversationLog`, `RiskAssessment`), and call `backend/src/db/qdrant.js`'s `upsertConversationEmbedding`/`searchRelevantContext` so the agent actually gets RAG context — right now Qdrant search works standalone but nothing calls it from a real conversation.
- A new `/api/profile` route (Turso-backed) — not started.
- The agent's tool set only has `runWhatIfSimulation` and `calculateRequiredContribution` today — `getRiskProfile`, `checkMicroMoment`, `escalateToRM` from the original architecture are designed but not implemented as callable tools.

See [FEATURES.md](./FEATURES.md) for the full ✅/⚠️/🚧 status per feature.
