# Setup

Stack locked in: **Groq** (LLM), **local free embeddings** via `@xenova/transformers` (no API key, runs in-process — genuinely free, no rate limits, no signup), **Clerk** (auth), MongoDB Atlas + Turso + Qdrant (data layer), Next.js + Express (app).

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

## 5. Qdrant (local dev, free)
```bash
docker run -p 6333:6333 qdrant/qdrant
```
Use Qdrant Cloud instead for anything beyond local dev — same client, just swap `QDRANT_URL`/`QDRANT_API_KEY`.

## 6. Turso — create the database
```bash
turso db create twinfolio-db
turso db show twinfolio-db --url          # → TURSO_DATABASE_URL
turso db tokens create twinfolio-db       # → TURSO_AUTH_TOKEN
```

## 7. Drizzle — schema & migrations (Turso)
```bash
cd backend
npx drizzle-kit generate
npx drizzle-kit push
cd ..
```

## 8. Run it
```bash
# terminal 1
cd frontend && npm run dev

# terminal 2
cd backend && npm run dev
```

## 9. First things to wire up
- Clerk middleware in Express (`@clerk/express`) to protect API routes, and `<ClerkProvider>` in the Next.js app
- A `scripts/create-qdrant-collection.js` one-off script — vector size must match `@xenova/transformers`' chosen model output (e.g. `Xenova/all-MiniLM-L6-v2` → 384 dimensions)
- The LangChain.js agent (`@langchain/groq` ChatGroq model) with its tools: `runSimulation`, `getRiskProfile`, `getBiasFlags`, `checkMicroMoment`, `escalateToRM` (see [ARCHITECTURE.md](./ARCHITECTURE.md))
