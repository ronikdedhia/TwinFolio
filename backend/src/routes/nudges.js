import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/turso.js";
import { profiles } from "../db/schema.js";
import { connectMongo } from "../db/mongo.js";
import { Nudge } from "../db/models/Nudge.js";
import { generateNudges } from "../services/nudgeService.js";

const router = Router();

// GET /api/nudges — the twin noticing things about the customer's own
// profile without being asked (see services/nudgeService.js).
router.get("/nudges", async (req, res) => {
  try {
    const rows = await db.select().from(profiles).where(eq(profiles.userId, req.userId));
    if (rows.length === 0) {
      return res.status(404).json({ error: "No profile set up yet — create one with PUT /api/profile first" });
    }

    const nudges = generateNudges(rows[0]);

    await connectMongo();
    if (nudges.length > 0) {
      await Nudge.insertMany(nudges.map((n) => ({ ...n, userId: req.userId })));
    }

    res.json({ nudges });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
