import { Router } from "express";
import { db } from "../db/turso.js";
import { profiles } from "../db/schema.js";
import { connectMongo } from "../db/mongo.js";
import { RiskAssessment } from "../db/models/RiskAssessment.js";
import { Nudge } from "../db/models/Nudge.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// GET /api/admin/customers — the bank-helper's window into every customer's
// twin: their plan, latest risk read, and latest nudge, in one place.
router.get("/admin/customers", requireAdmin, async (req, res) => {
  try {
    const allProfiles = await db.select().from(profiles);
    await connectMongo();

    const customers = await Promise.all(
      allProfiles.map(async (profile) => {
        const [latestRisk, latestNudge] = await Promise.all([
          RiskAssessment.findOne({ userId: profile.userId }).sort({ createdAt: -1 }).lean(),
          Nudge.findOne({ userId: profile.userId }).sort({ createdAt: -1 }).lean(),
        ]);
        return { profile, latestRisk, latestNudge };
      })
    );

    res.json({ customers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
