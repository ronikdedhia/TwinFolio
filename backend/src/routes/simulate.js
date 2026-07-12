import { Router } from "express";
import { runMonteCarloSimulation, requiredMonthlyContribution } from "../services/simulationEngine.js";

const router = Router();

// POST /api/simulate — "what if" projection (the crystal ball)
router.post("/simulate", (req, res) => {
  try {
    const result = runMonteCarloSimulation(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/simulate/required-contribution — goal back-calculation
router.post("/simulate/required-contribution", (req, res) => {
  try {
    const requiredContribution = requiredMonthlyContribution(req.body);
    res.json({ requiredMonthlyContribution: requiredContribution });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
