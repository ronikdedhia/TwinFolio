import { Router } from "express";
import { assessRiskProfile } from "../agent/riskProfileModel.js";
import { getSyntheticBehaviorEvents, listPresetNames } from "../services/syntheticBehavior.js";

const router = Router();

// POST /api/risk-profile
// Body: either { events: [{date, type, description}, ...] } for real/custom
// data, or { preset: "panic-seller" } to use a synthetic dev/demo scenario.
router.post("/risk-profile", async (req, res) => {
  const { events, preset } = req.body;

  let eventsToAnalyze;
  if (preset) {
    try {
      eventsToAnalyze = getSyntheticBehaviorEvents(preset);
    } catch (err) {
      return res.status(400).json({ error: err.message, availablePresets: listPresetNames() });
    }
  } else if (Array.isArray(events) && events.length > 0) {
    eventsToAnalyze = events;
  } else {
    return res.status(400).json({
      error: "Provide either a non-empty 'events' array or a 'preset' name",
      availablePresets: listPresetNames(),
    });
  }

  try {
    const assessment = await assessRiskProfile(eventsToAnalyze);
    res.json(assessment);
  } catch (err) {
    // GROQ_API_KEY missing, model call failure, etc. — a server-side problem, not a bad request
    res.status(500).json({ error: err.message });
  }
});

export default router;
