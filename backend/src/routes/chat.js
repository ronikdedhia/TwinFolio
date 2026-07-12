import { Router } from "express";
import { runFinancialTwinAgent } from "../agent/financialTwinAgent.js";

const router = Router();

// POST /api/chat — talk to the financial twin
router.post("/chat", async (req, res) => {
  const { message, profile } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message (string) is required" });
  }
  if (!profile || typeof profile !== "object") {
    return res.status(400).json({ error: "profile object is required" });
  }

  try {
    const reply = await runFinancialTwinAgent({ message, profile });
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
