# Twinfolio — frontend

Next.js (App Router) client for the financial digital twin. Talks to the Express backend in `../backend` over HTTP — this app has no server-side data logic of its own beyond Next's routing/rendering.

## Pages

- `/` — the goal dashboard: profile inputs, Monte Carlo "what if" projection, proactive nudges banner, and a chat sidebar to talk to your twin.
- `/staff` — the bank-helper view: every customer's plan, latest risk read, and latest nudge in one table. Gated server-side by the backend's `ADMIN_USER_IDS` allowlist — signing in isn't enough on its own.

Both pages gate on Clerk sign-in state (`<Show when="signed-in">` / `"signed-out"`) and render a `<SignIn />` form when logged out.

## Structure

```
src/
├── app/
│   ├── layout.tsx      # wraps the app in <ClerkProvider>
│   ├── page.tsx         # dashboard
│   └── staff/page.tsx    # staff view
├── components/
│   ├── Nav.tsx           # shared header: brand, dashboard/staff links, user menu
│   ├── Chat.tsx          # chat panel wired to POST /api/chat
│   └── Nudges.tsx        # fetches GET /api/nudges, renders proactive suggestions
└── lib/
    └── api.ts            # apiFetch() — attaches the Clerk session token to every backend call
```

## Getting started

Requires the backend running first (see `../backend`, or `../SETUP.md` for the full local setup).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

This app reads its own `.env.local` (Next.js doesn't inherit the root `.env` the backend uses). At minimum:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=   # same Clerk project as the backend's CLERK_SECRET_KEY
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

## Notes for whoever picks this up next

- Next.js is pinned to a version released after most training data cutoffs (see `AGENTS.md` in this directory) — some conventions have changed, e.g. `middleware.ts` is deprecated in favor of `proxy.ts`, and Clerk's `SignedIn`/`SignedOut` components were replaced by a single `<Show when="signed-in" | "signed-out">`. Check `node_modules/next/dist/docs` before assuming an API from memory.
- `lottie-react` is an installed dependency with no animation asset wired in yet — it's there for the planned 2D avatar, not currently used anywhere.
