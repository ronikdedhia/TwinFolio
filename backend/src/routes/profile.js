import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/turso.js";
import { profiles } from "../db/schema.js";

const router = Router();

router.get("/profile", async (req, res) => {
  try {
    const rows = await db.select().from(profiles).where(eq(profiles.userId, req.userId));
    if (rows.length === 0) {
      return res.status(404).json({ error: "No profile found for this user — create one with PUT /api/profile" });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/profile", async (req, res) => {
  const { currentSavings, monthlyContribution, years, goalAmount } = req.body;
  const fields = { currentSavings, monthlyContribution, years, goalAmount };
  for (const [name, value] of Object.entries(fields)) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return res.status(400).json({ error: `${name} must be a finite number` });
    }
  }

  const now = new Date().toISOString();
  try {
    await db
      .insert(profiles)
      .values({ userId: req.userId, ...fields, createdAt: now, updatedAt: now })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: { ...fields, updatedAt: now },
      });

    const rows = await db.select().from(profiles).where(eq(profiles.userId, req.userId));
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
