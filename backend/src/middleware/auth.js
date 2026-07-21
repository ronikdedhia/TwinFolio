import { clerkMiddleware, getAuth } from "@clerk/express";

// Attaches auth info to every request without blocking — apply globally.
export const withClerk = clerkMiddleware();

// Apply per-route to actually require a signed-in user.
// Not using @clerk/express's requireAuth() here — it's designed to redirect
// unauthenticated *browser navigations* to a sign-in page, which is wrong
// behavior for a JSON API. This returns a plain 401 instead.
export function requireUser(req, res, next) {
  const auth = getAuth(req);
  if (!auth?.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  req.userId = auth.userId;
  next();
}

// Apply after requireUser. Gates the bank-helper staff view — allowlist-based
// rather than a Clerk role/org, since this is the simplest thing that's
// actually correct for a small internal team.
const ADMIN_USER_IDS = new Set(
  (process.env.ADMIN_USER_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
);

export function requireAdmin(req, res, next) {
  if (!ADMIN_USER_IDS.has(req.userId)) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
